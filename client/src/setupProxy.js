const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use((req, res, next) => {
        res.set({
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        });
        next();
    });
};