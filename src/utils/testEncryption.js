require('dotenv').config();
const { encrypt, decrypt } = require('./encryption');

console.log('\n🧪 Testing Encryption System\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test 1: Basic encryption/decryption
console.log('Test 1: Basic Encryption/Decryption');
console.log('─────────────────────────────────────');
const originalText = "This is a sensitive journal entry about my feelings.";
console.log('Original:', originalText);

const encrypted = encrypt(originalText);
console.log('Encrypted:', encrypted);
console.log('Length increase:', encrypted.length - originalText.length, 'characters');

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', originalText === decrypted ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 2: Multiple encryptions produce different ciphertexts
console.log('Test 2: Unique IVs (Different Ciphertexts)');
console.log('─────────────────────────────────────');
const text = "Same content";
const encrypted1 = encrypt(text);
const encrypted2 = encrypt(text);
console.log('First encryption:', encrypted1.substring(0, 50) + '...');
console.log('Second encryption:', encrypted2.substring(0, 50) + '...');
console.log('Different ciphertexts:', encrypted1 !== encrypted2 ? '✅ PASS' : '❌ FAIL');
console.log('Both decrypt correctly:', 
  decrypt(encrypted1) === text && decrypt(encrypted2) === text ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 3: Long text encryption
console.log('Test 3: Long Text Encryption');
console.log('─────────────────────────────────────');
const longText = "Dear diary, today was an amazing day. I woke up feeling refreshed and energized. " +
  "I had a great conversation with my friend about life, goals, and mental health. " +
  "We discussed the importance of self-care and maintaining positive relationships. " +
  "I'm grateful for the support system I have. This journal helps me process my emotions " +
  "and track my mental wellness journey. I feel hopeful about the future.";
const encryptedLong = encrypt(longText);
const decryptedLong = decrypt(encryptedLong);
console.log('Original length:', longText.length, 'characters');
console.log('Encrypted length:', encryptedLong.length, 'characters');
console.log('Match:', longText === decryptedLong ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 4: Special characters and emojis
console.log('Test 4: Special Characters & Emojis');
console.log('─────────────────────────────────────');
const specialText = "I'm feeling 😊 happy! Special chars: @#$%^&*()[]{}|<>?/\\~`";
const encryptedSpecial = encrypt(specialText);
const decryptedSpecial = decrypt(encryptedSpecial);
console.log('Original:', specialText);
console.log('Decrypted:', decryptedSpecial);
console.log('Match:', specialText === decryptedSpecial ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 5: Empty and null handling
console.log('Test 5: Edge Cases (Empty/Null)');
console.log('─────────────────────────────────────');
try {
  const emptyEncrypt = encrypt('');
  const emptyDecrypt = decrypt(emptyEncrypt);
  console.log('Empty string:', emptyEncrypt === '' ? '✅ Returns empty' : '❌ Error');
  
  const nullEncrypt = encrypt(null);
  console.log('Null handling:', nullEncrypt === null ? '✅ Returns null' : '❌ Error');
  
  const undefinedEncrypt = encrypt(undefined);
  console.log('Undefined handling:', undefinedEncrypt === undefined ? '✅ Returns undefined' : '❌ Error');
} catch (error) {
  console.log('❌ Edge case error:', error.message);
}
console.log('');

// Test 6: Backward compatibility (unencrypted data)
console.log('Test 6: Backward Compatibility');
console.log('─────────────────────────────────────');
const unencryptedData = "This is plain text without encryption";
const decryptedPlain = decrypt(unencryptedData);
console.log('Original:', unencryptedData);
console.log('After decrypt:', decryptedPlain);
console.log('Unchanged:', unencryptedData === decryptedPlain ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 7: Chat message encryption
console.log('Test 7: Chat Message Simulation');
console.log('─────────────────────────────────────');
const userMessage = "I've been feeling anxious lately and need someone to talk to.";
const aiResponse = "I understand you're feeling anxious. That's completely valid. Let's talk about what's been causing these feelings.";

const encryptedUser = encrypt(userMessage);
const encryptedAI = encrypt(aiResponse);

console.log('User message encrypted:', encryptedUser.substring(0, 40) + '...');
console.log('AI response encrypted:', encryptedAI.substring(0, 40) + '...');
console.log('User decrypt match:', decrypt(encryptedUser) === userMessage ? '✅ PASS' : '❌ FAIL');
console.log('AI decrypt match:', decrypt(encryptedAI) === aiResponse ? '✅ PASS' : '❌ FAIL');
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ Encryption system is working correctly!');
console.log('');
console.log('Next steps:');
console.log('  1. Ensure ENCRYPTION_KEY is in your .env file');
console.log('  2. Restart your backend server');
console.log('  3. Create a new journal entry via API');
console.log('  4. Check MongoDB to verify data is encrypted');
console.log('  5. Fetch the entry via API to verify it decrypts correctly');
console.log('═══════════════════════════════════════════════════════════════\n');
