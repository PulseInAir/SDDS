import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard IV length for GCM

// The legacy fallback logic evaluated RAW_KEY at module load time.
const LEGACY_RAW_KEY = process.env.PORTAL_PASSWORD_KEY || process.env.ENCRYPTION_KEY;

export function getLegacyKey(): Buffer {
  const keySource = LEGACY_RAW_KEY || 'default_fallback_sdds_key_for_development';
  return crypto.createHash('sha256').update(keySource).digest();
}

/**
 * Validates and returns the configured ENCRYPTION_KEY as a 32-byte Buffer.
 * Must be exactly 64 hexadecimal characters.
 */
export function getConfiguredKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey) {
    throw new Error('ENCRYPTION_KEY environment variable is missing.');
  }
  if (hexKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(hexKey)) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes).');
  }
  return Buffer.from(hexKey, 'hex');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns the format `iv:ciphertext:tag`
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  // Will throw clear server-side error if missing or invalid
  const key = getConfiguredKey();
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Expects the format `iv:ciphertext:tag`
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Try the new configured key first
    try {
      const key = getConfiguredKey();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      // Fall through to legacy if new key is missing/invalid or decryption fails
    }
    
    // Temporary legacy path
    const legacyKey = getLegacyKey();
    const decipherLegacy = crypto.createDecipheriv(ALGORITHM, legacyKey, iv);
    decipherLegacy.setAuthTag(authTag);
    let decryptedLegacy = decipherLegacy.update(ciphertext, 'hex', 'utf8');
    decryptedLegacy += decipherLegacy.final('utf8');
    
    return decryptedLegacy;
  } catch {
    // Never log plaintext, keys, ciphertext, IVs or tags
    console.error('Decryption failed.');
    return '[Decryption Error]';
  }
}
