const crypto = require('node:crypto');

// Minimal hand-rolled HS256 JWT (base64url header.payload.signature). No dependency — and a
// clear demonstration of what a JWT actually is. Production might prefer `jose`/`jsonwebtoken`.

const b64url = (input) => Buffer.from(input).toString('base64url');

function hmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function sign(payload, secret, { expiresInSec = 604800, now = () => Date.now() } = {}) {
  const issuedAt = Math.floor(now() / 1000);
  const body = { ...payload, iat: issuedAt, exp: issuedAt + expiresInSec };
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = `${head}.${b64url(JSON.stringify(body))}`;
  return `${data}.${hmac(data, secret)}`;
}

function verify(token, secret, { now = () => Date.now() } = {}) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('malformed token');

  const [head, payloadPart, signature] = parts;
  const expected = hmac(`${head}.${payloadPart}`, secret);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  // Constant-time compare; length check first since timingSafeEqual requires equal lengths.
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('invalid signature');
  }

  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  if (payload.exp && Math.floor(now() / 1000) >= payload.exp) {
    throw new Error('token expired');
  }
  return payload;
}

module.exports = { sign, verify };
