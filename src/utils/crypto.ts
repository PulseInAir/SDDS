import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard IV length for GCM

const RAW_KEY = process.env.PORTAL_PASSWORD_KEY || process.env.ENCRYPTION_KEY;

// Derives a valid 32-byte key from the configured key using SHA-256
function getEncryptionKey(): Buffer {
  const keySource = RAW_KEY || 'default_fallback_sdds_key_for_development';
  return crypto.createHash('sha256').update(keySource).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns the format `iv:ciphertext:tag`
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  if (!process.env.PORTAL_PASSWORD_KEY && !process.env.ENCRYPTION_KEY) {
    throw new Error('Encryption failed: PORTAL_PASSWORD_KEY or ENCRYPTION_KEY environment variable is missing.');
  }
  
  const key = getEncryptionKey();
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
  
  if (!process.env.PORTAL_PASSWORD_KEY && !process.env.ENCRYPTION_KEY) {
    return 'Portal Password Decryption MISSING KEY: PORTAL_PASSWORD_KEY or ENCRYPTION_KEY environment variable is not configured.';
  }
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid format: encrypted text must contain iv, ciphertext, and tag.');
    }
    
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption Error]';
  }
}
