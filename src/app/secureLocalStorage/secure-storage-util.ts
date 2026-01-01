import CryptoJS from 'crypto-js';
import SecureStorage from 'secure-web-storage';

// Secret key for encryption (256-bit key)
const SECRET_KEY = CryptoJS.enc.Utf8.parse('your-secret-key'.padEnd(32, '0'));

// 16-byte IV (Initialization Vector)
const IV = CryptoJS.enc.Utf8.parse('random-init-vector'.padEnd(16, '0'));

// Hash function for key hashing
const hashKey = (key: string): string => {
  if (!key) {
    throw new Error('Key cannot be null or empty');
  }
  return CryptoJS.SHA256(key).toString();
};

// Encryption function for value encryption
const encryptData = (data: string): string => {
  if (!data || data.trim() === '') {
    console.error('Data cannot be null or empty');
    throw new Error('Data cannot be null or empty');
  }
  return CryptoJS.AES.encrypt(data, SECRET_KEY, { iv: IV }).toString();
};

// Decryption function for value decryption
const decryptData = (data: string): string => {
  if (!data) {
    console.error('No data provided for decryption.');
    return ''; // Return an empty string in case of null or invalid data
  }
  try {
    // Pass the same IV used during encryption
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY, { iv: IV });
    const decrypted = CryptoJS.enc.Utf8.stringify(bytes);
    return decrypted || ''; // Ensure the return value is always a string
  } catch (error) {
    console.error('Error decrypting data:', error);
    return ''; // Return an empty string in case of decryption error
  }
};

// Initialize SecureStorage with localStorage
export const secureLocalStorage = new SecureStorage(localStorage, {
  hash: hashKey,
  encrypt: encryptData,
  decrypt: decryptData,
});

// Initialize SecureStorage with sessionStorage
// export const secureSessionStorage = new SecureStorage(sessionStorage, {
//   hash: hashKey,
//   encrypt: encryptData,
//   decrypt: decryptData,
// });
