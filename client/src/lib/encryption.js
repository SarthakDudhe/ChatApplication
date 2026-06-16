import CryptoJS from "crypto-js";

// Helper to generate a conversation-specific key derived from sender and receiver IDs
const getConversationKey = (senderId, receiverId) => {
  if (!senderId || !receiverId) return "default-fallback-key";
  // Deterministic order so both users generate the exact same key
  return [senderId.toString(), receiverId.toString()].sort().join("-");
};

/**
 * Encrypts plaintext message text using AES with a derived key
 * @param {string} text - Plain text message
 * @param {string} senderId - Sender MongoDB Object ID
 * @param {string} receiverId - Receiver MongoDB Object ID
 * @returns {string} Ciphertext
 */
export const encryptMessage = (text, senderId, receiverId) => {
  if (!text) return "";
  try {
    const key = getConversationKey(senderId, receiverId);
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return text;
  }
};

/**
 * Decrypts ciphertext message text using AES with a derived key
 * @param {string} ciphertext - Encrypted text
 * @param {string} senderId - Sender MongoDB Object ID
 * @param {string} receiverId - Receiver MongoDB Object ID
 * @returns {string} Plaintext
 */
export const decryptMessage = (ciphertext, senderId, receiverId) => {
  if (!ciphertext) return "";
  try {
    const key = getConversationKey(senderId, receiverId);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // If decryption yields empty string, it might already be plaintext (legacy messages)
      return ciphertext;
    }
    return decrypted;
  } catch (error) {
    // If decryption fails, assume it's legacy plaintext
    return ciphertext;
  }
};
