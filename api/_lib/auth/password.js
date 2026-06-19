const bcrypt = require('bcryptjs');

// Cost factor 10: ~standard, a good balance of security and latency for a serverless login.
const COST = 10;

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, COST);
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = { hashPassword, verifyPassword };
