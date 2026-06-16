// Local dev entry point for /api/arxiv. The CRA dev server runs this in Node, so it can
// use the exact same gateway as the production Vercel function (api/arxiv.js) instead of a
// separate proxy — keeping dev and prod behaviour identical.
const { createArxivHandler } = require('../api/_lib/create-handler');

module.exports = function (app) {
  const handler = createArxivHandler();
  app.use('/api/arxiv', (req, res) => handler(req, res));
};
