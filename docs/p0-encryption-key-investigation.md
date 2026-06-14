# P0 Encryption Key Investigation

## Verdict
**Confirmed Defect (Fallback Injection Risk & Decoupled State)**

## Current Encryption Contract
* **Algorithm**: `AES-256-GCM`
* **Key Encoding/Length**: The actual `ENCRYPTION_KEY` or `PORTAL_PASSWORD_KEY` string is hashed using SHA-256 (`crypto.createHash('sha256').update(keySource).digest()`) to produce a raw 32-byte `Buffer` key. The required length of the environment variable itself is therefore completely arbitrary (despite the `.env` comment stating it must be a 32-byte hex string).
* **Storage Format**: `iv:ciphertext:tag` (all segments in hex format, separated by colons). The IV is 12 bytes.
* **Encryption Versioning**: None. There is no version identifier stored in the ciphertext. All keys are assumed current.

## Call-Path Map
* **Encrypt**: `encrypt(text)`
  * `createClientForAYAction` (New Client Creation)
  * `updateClientPasswordAction` (Password Update)
  * `createFilingForAYAction` (Filing Creation)
  * `importClientsAction` (Bulk CSV Import)
* **Decrypt**: `decrypt(encryptedText)`
  * `decryptPasswordAction` (Password Reveal)
* **Server Boundary**: Both functions use Node's `crypto` module and are exclusively called within server actions.

## Environment Matrix
* **Variables**: `PORTAL_PASSWORD_KEY` (Primary), `ENCRYPTION_KEY` (Fallback)
* **Local Scope**: `.env` contains `ENCRYPTION_KEY`. `PORTAL_PASSWORD_KEY` is absent.
* **Settings Page Scope**: `src/app/(dashboard)/settings/page.tsx` explicitly checks `!!process.env.ENCRYPTION_KEY` but completely ignores `PORTAL_PASSWORD_KEY`, leading to a decoupled configuration status.

## Historical Compatibility Findings
* Initial implementation (`7f23d70`) used `ENCRYPTION_KEY`.
* A later commit (`1f169fb`) introduced `PORTAL_PASSWORD_KEY` as the prioritized key.
* The structure of the ciphertext (`iv:ciphertext:tag`) has remained constant since inception.

## Ciphertext-Format Findings
* **Count**: 129 records in `client_secrets`.
* **Valid Format**: All 129 records successfully match the `iv:ciphertext:tag` format.
* **Malformed/Empty**: 0 malformed, 0 empty.
* **Conclusion**: Failures are not due to malformed string structures or partial overwrites. Any decryption failure is tied to a mismatched key affecting either all records or records encrypted during a specific runtime state.

## Exact "MISSING KEY" Cause
The exact literal `"Portal Password Decryption MISSING KEY: ..."` is produced when:
```typescript
!process.env.PORTAL_PASSWORD_KEY && !process.env.ENCRYPTION_KEY
```
evaluates to `true` at the *exact moment of the function call*.

**The Ambiguity & Defect**:
1. `const RAW_KEY = ...` is evaluated **at module load time**. If environment variables are not populated at the exact millisecond the module is loaded (e.g., during certain dev or edge initialization sequences), `RAW_KEY` evaluates to `undefined`.
2. Later, at runtime, the `decrypt` or `encrypt` function is called. The environment variables might now be populated. The `if` check passes.
3. `getEncryptionKey()` executes and uses `RAW_KEY`. Because `RAW_KEY` is a constant evaluated earlier as `undefined`, it silently falls back to `'default_fallback_sdds_key_for_development'`.
4. This results in the system silently encrypting/decrypting using the insecure fallback key instead of the active environment variable.

## Recovery Risk
If records were silently encrypted with the `'default_fallback_sdds_key_for_development'` due to this module-load timing defect, fixing the bug to correctly use the environment variable will instantly break decryption for all those records (since they were saved with the fallback key).

## Safest Fix
1. Move the resolution of the environment variables *inside* `getEncryptionKey()` so they are evaluated strictly at call-time, not at module-load time.
2. Remove the insecure fallback string completely.
3. Update `src/app/(dashboard)/settings/page.tsx` to correctly reflect the presence of `PORTAL_PASSWORD_KEY` alongside `ENCRYPTION_KEY`.

## Files Required for the Later Fix
* `src/utils/crypto.ts`
* `src/app/(dashboard)/settings/page.tsx`

## Verification Tests
* Test password creation/encryption and verify decryption succeeds.
* Verify the fallback string is no longer used by artificially testing missing variables.
* Verify the settings page correctly detects `PORTAL_PASSWORD_KEY`.

## Blockers
No immediate blockers for code remediation, but executing the fix risks rendering current `client_secrets` undecryptable if they were previously encrypted using the fallback key. A key-migration or test script should verify if the DB records decrypt successfully with the true environment key vs the fallback key before deploying.
