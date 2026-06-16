import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { encrypt, decrypt, getConfiguredKey } from '../utils/crypto';

// Load environment variables from .env
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function migrate(supabaseClient: any, isDryRun: boolean) {
  console.log(`Starting Encryption Key Migration ${isDryRun ? '(DRY RUN)' : ''}`);

  try {
    // Validate that the configured key is valid before starting
    const newKey = getConfiguredKey();
  } catch (error: any) {
    console.error('Fatal Error: Configured ENCRYPTION_KEY is invalid.');
    console.error(error.message);
    throw error;
  }

  // Fetch all client secrets
  const { data: records, error: fetchError } = await supabaseClient
    .from('client_secrets')
    .select('client_id, encrypted_password');

  if (fetchError) {
    console.error('Failed to fetch records:', fetchError.message);
    throw new Error(fetchError.message);
  }

  if (!records) {
    console.log('No records found.');
    return { total: 0, migrated: 0, failed: 0, alreadyValid: 0 };
  }

  const totalRecords = records.length;
  let alreadyMigrated = 0;
  let toMigrate = 0;
  let failed = 0;
  let updated = 0;

  for (const record of records) {
    if (!record.encrypted_password) continue;

    // 1. Can we decrypt it with the configured key directly?
    let decryptableWithConfigured = false;
    try {
      const parts = record.encrypted_password.split(':');
      if (parts.length === 3) {
        const iv = Buffer.from(parts[0], 'hex');
        const ciphertext = parts[1];
        const authTag = Buffer.from(parts[2], 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', getConfiguredKey(), iv);
        decipher.setAuthTag(authTag);
        let dec = decipher.update(ciphertext, 'hex', 'utf8');
        dec += decipher.final('utf8');
        decryptableWithConfigured = true;
      }
    } catch (e) {
      decryptableWithConfigured = false;
    }

    if (decryptableWithConfigured) {
      alreadyMigrated++;
      continue;
    }

    // 2. Try decrypting using the general decrypt() which will fall back to legacy
    const plaintext = decrypt(record.encrypted_password);
    
    if (plaintext === '' || plaintext === '[Decryption Error]' || plaintext.startsWith('Portal Password Decryption MISSING KEY')) {
      // Malformed or undecryptable data
      console.error(`Stopping: Found undecryptable data.`);
      failed++;
      throw new Error('Undecryptable data found'); // stop on malformed or undecryptable data
    }

    toMigrate++;

    if (!isDryRun) {
      // Re-encrypt with the configured key
      const newCiphertext = encrypt(plaintext);
      
      // Update only when the stored ciphertext still matches the originally read value
      const { error: updateError, count } = await supabaseClient
        .from('client_secrets')
        .update({ encrypted_password: newCiphertext })
        .eq('client_id', record.client_id)
        .eq('encrypted_password', record.encrypted_password); // optimistic concurrency control

      if (updateError) {
        console.error('Failed to update record:', updateError.message);
        failed++;
      } else {
        updated++;
      }
    }
  }

  console.log('\nMigration Summary:');
  console.log(`Total records checked: ${totalRecords}`);
  console.log(`Already migrated / valid: ${alreadyMigrated}`);
  console.log(`Requiring migration: ${toMigrate}`);
  
  if (!isDryRun) {
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed updates: ${failed}`);
  } else {
    console.log(`(Dry run) Would update: ${toMigrate}`);
  }

  return { total: totalRecords, migrated: updated, failed, alreadyValid: alreadyMigrated, toMigrate };
}

// Only execute if run directly
if (require.main === module) {
  loadEnvConfig(process.cwd());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const isDryRun = process.argv.includes('--dry-run');

  migrate(supabase, isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
