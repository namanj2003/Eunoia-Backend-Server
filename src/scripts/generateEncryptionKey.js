const crypto = require('crypto');

function generateEncryptionKey() {
  const key = crypto.randomBytes(32).toString('hex');
  console.log('ENCRYPTION KEY GENERATED');
  console.log(`ENCRYPTION_KEY=${key}`);
}

generateEncryptionKey();
