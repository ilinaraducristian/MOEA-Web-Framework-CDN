module.exports = environment = {
  production: true,
  port: process.env.PORT,
  authentication_issuer_url: process.env.AUTHENTICATION_ISSUER_URL,
  data_path: process.env.DATA_PATH,
  secureRoutes: [".+"],
};
