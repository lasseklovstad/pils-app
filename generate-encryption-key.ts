import * as crypto from "node:crypto";

// Generate a 32-byte encryption key (256 bits for AES-256)
const key = crypto.randomBytes(32);

// Print the key in hex format
console.log("Encryption Key (hex):", key.toString("hex"));
