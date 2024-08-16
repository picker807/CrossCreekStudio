module.exports = {
  "/api": {
    target: process.env.SITE_URL,
    secure: false,
    changeOrigin: true
  }
};