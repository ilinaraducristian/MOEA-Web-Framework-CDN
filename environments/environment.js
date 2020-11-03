module.exports = {
  production: false,
  port: 8080,
  authentication_issuer_url:
    "http://localhost:8180/auth/realms/MOEA-Web-Framework",
  data_path: "./content",
  secureRoutes: [
    /*"^/[A-Fa-f0-9]{64}$"*/
    /*".+"*/
  ],
};
