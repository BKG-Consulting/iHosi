// Test script to verify encryption/decryption functionality
const crypto = require('crypto');

// Test encryption key (same as in lib/encryption.ts)
const TEST_KEY = '39d653047162e71ce614d357feffe818e6a2630602c29c0c85edb00401a56d67';
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getEncryptionKey() {
  return Buffer.from(TEST_KEY, 'hex');
}

function encryptPHI(plaintext) {
  if (!plaintext || plaintext.trim() === '') {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Use modern crypto methods for Node.js v22+
    const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    const result = {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt PHI data');
  }
}

function decryptPHI(encryptedData) {
  if (!encryptedData) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const data = JSON.parse(encryptedData);
    
    // Use modern crypto methods for Node.js v22+
    const decipher = crypto.createDecipherGCM(ALGORITHM, key, Buffer.from(data.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Test the encryption/decryption
console.log('🔐 Testing PHI Encryption/Decryption...\n');

const testData = {
  phone: '1234567890',
  email: 'test@example.com',
  address: '123 Main St, City, State 12345',
  medical_history: 'Hypertension, Diabetes Type 2',
  allergies: 'Penicillin, Peanuts'
};

console.log('Original data:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n' + '='.repeat(50) + '\n');

// Test individual field encryption
console.log('Testing individual field encryption:');
Object.entries(testData).forEach(([field, value]) => {
  const encrypted = encryptPHI(value);
  const decrypted = decryptPHI(encrypted);
  
  console.log(`${field}:`);
  console.log(`  Original: ${value}`);
  console.log(`  Encrypted: ${encrypted}`);
  console.log(`  Decrypted: ${decrypted}`);
  console.log(`  Match: ${value === decrypted ? '✅' : '❌'}`);
  console.log('');
});

console.log('='.repeat(50));
console.log('✅ Encryption/Decryption test completed!');
console.log('\n📝 Note: In Prisma Studio, you should now see encrypted data (JSON strings)');
console.log('   instead of plain text for sensitive fields like phone, email, address, etc.');
