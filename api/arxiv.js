// Production entry point (Vercel serverless function) for /api/arxiv.
// All logic lives in the shared gateway so this matches local dev exactly.
const { createArxivHandler } = require('./_lib/create-handler');

const handler = createArxivHandler();

module.exports = (req, res) => handler(req, res);
