export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-fA-F]{64}$/.test(cleanHex)) throw new Error('Use a 32-byte ID: 64 hexadecimal characters.');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBase58(hex: string): string {
  const bytes = hexToBytes(hex);
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = BigInt('0x' + bytesToHex(bytes));
  let result = '';
  while (value > 0n) {
    result = alphabet[Number(value % 58n)] + result;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}

export function identifierToBytes(input: string): Uint8Array {
  const value = input.trim();
  if (/^(?:0x)?[0-9a-fA-F]{64}$/.test(value)) return hexToBytes(value);
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) throw new Error('Use a base58 Platform ID or 64 hexadecimal characters.');
  let decoded = 0n;
  for (const char of value) decoded = decoded * 58n + BigInt(alphabet.indexOf(char));
  const bytes: number[] = [];
  while (decoded > 0n) {
    bytes.unshift(Number(decoded & 255n));
    decoded >>= 8n;
  }
  for (const char of value) {
    if (char !== '1') break;
    bytes.unshift(0);
  }
  if (bytes.length !== 32) throw new Error('A Platform ID must decode to exactly 32 bytes.');
  return Uint8Array.from(bytes);
}

export function identifierToBase58(input: string): string {
  return hexToBase58(bytesToHex(identifierToBytes(input)));
}
