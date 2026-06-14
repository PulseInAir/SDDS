# P0 Encryption Migration Plan

## Files Changed
* `src/utils/crypto.ts`: Standardised the `ENCRYPTION_KEY` contract, updated `encrypt()` to enforce the new key, updated `decrypt()` to fall back to the legacy hashing logic if the configured key fails.
* `src/app/(dashboard)/settings/page.tsx` & `src/ui/views/settings/SettingsClient.tsx`: Updated to validate `ENCRYPTION_KEY` format precisely (64 hex characters) and differentiate between `Missing Key`, `Invalid Format`, and `Enabled`.
* `src/scripts/migrate-encryption-keys.ts`: Server-only utility to decrypt legacy portal passwords in memory and re-encrypt them with the configured `ENCRYPTION_KEY`.
* `src/utils/crypto.test.ts`: Added tests verifying crypto functions, format validation, legacy compatibility, and the migration utility dry-run/rerun logic.

## Final Key Contract
* **Name**: `ENCRYPTION_KEY`
* **Algorithm**: AES-256-GCM
* **Length**: 32 bytes
* **Format**: Exactly 64 hexadecimal characters
* **Fallback**: New encryptions strictly require the valid `ENCRYPTION_KEY`. Decryption attempts `ENCRYPTION_KEY` first, and temporarily falls back to the old hashing implementation only if needed.

## Dry-run Command
```bash
npx tsx src/scripts/migrate-encryption-keys.ts --dry-run
```

## Execution Command
```bash
npx tsx src/scripts/migrate-encryption-keys.ts
```

## Rollback Procedure
If the migration fails or corrupts passwords, restoring from a database backup is required since the migration replaces the ciphertexts in place. The legacy decryption fallback remains in the codebase, meaning if a backup of `client_secrets` is restored, the application will still be able to decrypt them exactly as it did before. 

## Expected Counts
* Total records: 129
* Already migrated / valid: 0
* Requiring migration: 129

## Exact Post-Migration Verification
1. Run the dry-run command. It should report `Requiring migration: 129`.
2. Run the execution command. It should report `Successfully updated: 129`.
3. Run the dry-run command again. It should report `Already migrated / valid: 129` and `Requiring migration: 0`.
4. Open the SDDS dashboard, navigate to a Client Profile, and manually verify that the Portal Password successfully reveals.

## Legacy-Removal Step
Once the migration is complete and verified, remove the legacy path from `src/utils/crypto.ts`:
1. Delete `LEGACY_RAW_KEY` and `getLegacyKey()`.
2. In `decrypt()`, remove the nested `try...catch` block. If `getConfiguredKey()` or decryption fails, it should immediately return `[Decryption Error]` instead of falling back.
