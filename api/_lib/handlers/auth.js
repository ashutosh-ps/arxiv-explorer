const { hashPassword, verifyPassword } = require('../auth/password');
const { sign } = require('../auth/jwt');
const { serializeAuthCookie, clearAuthCookie } = require('../auth/cookie');
const { getUserId } = require('../auth/require-auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

// Only ever expose non-sensitive fields — never the password hash.
const publicUser = (user) => ({ id: user.id, email: user.email });

// Auth handlers, framework-agnostic (work under both Vercel and the dev Express server).
// Dependencies (db, secret, cookie security) are injected for testability and config.
function createAuthHandlers({ db, jwtSecret, secure = true }) {
  function issueSession(res, user) {
    const token = sign({ sub: user.id }, jwtSecret);
    res.setHeader('Set-Cookie', serializeAuthCookie(token, { secure }));
  }

  return {
    async signup(req, res) {
      const { email, password } = req.body || {};
      if (!email || !EMAIL_RE.test(email) || !password || password.length < MIN_PASSWORD) {
        return res.status(400).json({ error: 'A valid email and a password of at least 8 characters are required.' });
      }
      let user;
      try {
        user = await db.createUser({ email, passwordHash: await hashPassword(password) });
      } catch (err) {
        if (err.code === 'EMAIL_EXISTS') {
          return res.status(409).json({ error: 'That email is already registered.' });
        }
        throw err;
      }
      issueSession(res, user);
      return res.status(201).json({ user: publicUser(user) });
    },

    async login(req, res) {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const user = await db.findUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      issueSession(res, user);
      return res.status(200).json({ user: publicUser(user) });
    },

    async logout(_req, res) {
      res.setHeader('Set-Cookie', clearAuthCookie({ secure }));
      return res.status(200).json({ ok: true });
    },

    async me(req, res) {
      const userId = getUserId(req, jwtSecret);
      const user = userId && (await db.findUserById(userId));
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }
      return res.status(200).json({ user: publicUser(user) });
    },
  };
}

module.exports = { createAuthHandlers };
