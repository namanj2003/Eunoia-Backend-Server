const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate Encryption Key Script
 * 
 * This script generates a secure encryption key for encrypting sensitive data
 * in the database (journal entries, chat messages).
 * 
 * Usage: node generateEncryptionKey.js
 */

function generateEncryptionKey() {
  // Generate a secure 256-bit (32 byte) key
  const key = crypto.randomBytes(32).toString('hex');
  
  console.log('\n🔐 Encryption Key Generated Successfully!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`ENCRYPTION_KEY=${key}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('⚠️  IMPORTANT SECURITY INSTRUCTIONS:');
  console.log('   1. Copy the above line to your .env file');
  console.log('   2. NEVER commit this key to version control');
  console.log('   3. Keep this key SECRET and SECURE');
  console.log('   4. Store it in a password manager or secure vault');
  console.log('   5. Use different keys for dev/staging/production');
  console.log('   6. If lost, encrypted data CANNOT be recovered!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Add the key to your .env file');
  console.log('   2. Add .env to .gitignore (if not already)');
  console.log('   3. Restart your server');
  console.log('   4. New data will be encrypted automatically\n');
  
  return key;
}

// Run the generator
const key = generateEncryptionKey();

// Optionally, automatically append to .env if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('ENCRYPTION_KEY=')) {
    console.log('📝 Adding ENCRYPTION_KEY to .env file...\n');
    
    const newContent = envContent.trimEnd() + '\n\n# Data Encryption (KEEP THIS SECRET!)\n' + 
                       '# This key is used to encrypt sensitive data in the database\n' +
                       `ENCRYPTION_KEY=${key}\n`;
    
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('✅ ENCRYPTION_KEY has been added to .env file!\n');
    console.log('⚠️  Remember to:');
    console.log('   - NEVER commit .env to git');
    console.log('   - Back up this key in a secure location');
    console.log('   - Restart your server for changes to take effect\n');
  } else {
    console.log('ℹ️  ENCRYPTION_KEY already exists in .env file.');
    console.log('   If you want to replace it, do so manually.\n');
    console.log('⚠️  WARNING: Changing the key will make old encrypted data unreadable!\n');
  }
} catch (error) {
  console.error('❌ Error accessing .env file:', error.message);
  console.log('\n💡 Please manually add the key to your .env file.\n');
}
