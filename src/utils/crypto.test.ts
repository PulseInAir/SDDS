import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { encrypt, decrypt, getLegacyKey } from './crypto';
import { migrate } from '../scripts/migrate-encryption-keys';

const originalEnv = { ...process.env };
const VALID_KEY_32 = '1111111111111111111111111111111111111111111111111111111111111111';

test('valid configured-key encryption/decryption', () => {
  process.env.ENCRYPTION_KEY = VALID_KEY_32;
  const plaintext = 'super_secret_password';
  const ciphertext = encrypt(plaintext);
  
  const decrypted = decrypt(ciphertext);
  assert.strictEqual(decrypted, plaintext);
  
  const parts = ciphertext.split(':');
  assert.strictEqual(parts.length, 3);
});

test('legacy decryption compatibility', () => {
  process.env.ENCRYPTION_KEY = VALID_KEY_32;
  const plaintext = 'legacy_password';
  
  const key = getLegacyKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  const legacyCiphertext = `${iv.toString('hex')}:${encrypted}:${authTag}`;
  
  const decrypted = decrypt(legacyCiphertext);
  assert.strictEqual(decrypted, plaintext);
});

test('missing key throws', () => {
  delete process.env.ENCRYPTION_KEY;
  assert.throws(() => encrypt('test'), /ENCRYPTION_KEY environment variable is missing/);
});

test('invalid key length/format throws', () => {
  process.env.ENCRYPTION_KEY = 'too_short';
  assert.throws(() => encrypt('test'), /ENCRYPTION_KEY must be exactly 64 hexadecimal characters/);
  
  process.env.ENCRYPTION_KEY = 'z'.repeat(64);
  assert.throws(() => encrypt('test'), /ENCRYPTION_KEY must be exactly 64 hexadecimal characters/);
});

test('configured-key ciphertext never using fallback', () => {
  process.env.ENCRYPTION_KEY = VALID_KEY_32;
  const plaintext = 'test';
  const ciphertext = encrypt(plaintext);
  
  const legacyKey = getLegacyKey();
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], 'hex');
  
  assert.throws(() => {
    const decipher = crypto.createDecipheriv('aes-256-gcm', legacyKey, iv);
    decipher.setAuthTag(authTag);
    let dec = decipher.update(encrypted, 'hex', 'utf8');
    dec += decipher.final('utf8');
  });
});

test('dry-run performs no writes and rerunning migration skips migrated records', async () => {
  process.env.ENCRYPTION_KEY = VALID_KEY_32;
  
  const legacyKey = getLegacyKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', legacyKey, iv);
  let encrypted = cipher.update('my_pass', 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const legacyCiphertext = `${iv.toString('hex')}:${encrypted}:${cipher.getAuthTag().toString('hex')}`;
  
  const records = [
    { client_id: '1', portal_password: legacyCiphertext }
  ];
  
  let updates = 0;
  
  const mockSupabase = {
    from: (_table: string) => ({
      select: () => ({ data: records, error: null }),
      update: (data: Record<string, unknown>) => {
        updates++;
        records[0].portal_password = data.portal_password;
        return {
          eq: () => ({
            eq: () => ({ error: null, count: 1 })
          })
        };
      }
    })
  };
  
  // Dry run
  const resDry = await migrate(mockSupabase, true);
  assert.strictEqual(resDry.toMigrate, 1);
  assert.strictEqual(updates, 0);
  
  // Actual run
  const resActual = await migrate(mockSupabase, false);
  assert.strictEqual(resActual.migrated, 1);
  assert.strictEqual(updates, 1);
  
  // Rerun (should skip since it's already migrated)
  const resRerun = await migrate(mockSupabase, false);
  assert.strictEqual(resRerun.alreadyValid, 1);
  assert.strictEqual(resRerun.toMigrate, 0);
  assert.strictEqual(updates, 1);
});

test('cleanup', () => {
  process.env = originalEnv;
});
