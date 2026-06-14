const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/arxiv',
    createProxyMiddleware({
      target: 'https://export.arxiv.org',
      changeOrigin: true,
      pathRewrite: { '^/api/arxiv': '/api/query' },
    })
  );
};
