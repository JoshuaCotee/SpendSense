import CryptoJS from 'crypto-js';

export function generateContentHash(content: string): string {
  const hash = CryptoJS.SHA256(content).toString();
  return hash.substring(0, 16);
}
