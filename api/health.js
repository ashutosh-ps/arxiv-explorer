// Production entry point (Vercel) for GET /api/health — a readiness probe reporting which
// store/db adapters are active.
const { createStore } = require('./_lib/store');
const { createDb } = require('./_lib/db');
const { createHealthHandler } = require('./_lib/handlers/health');

const handler = createHealthHandler({ store: createStore({}), db: createDb({}) });

module.exports = (req, res) => handler(req, res);
