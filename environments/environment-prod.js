module.exports = environment = {
  production: true,
  authentication_issuer_url: process.env.AUTHENTICATION_ISSUER_URL,
  data_path: process.env.DATA_PATH,
  secureRoutes: ["^/[A-Fa-f0-9]{64}$"],
};
