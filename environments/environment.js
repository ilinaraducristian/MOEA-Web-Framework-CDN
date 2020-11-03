module.exports = {
  production: false,
  authentication_issuer_url:
    "http://localhost:8180/auth/realms/MOEA-Web-Framework",
  secureRoutes: [
    /*"^/[A-Fa-f0-9]{64}$"*/
    /*".+"*/
  ],
  file_upload_config: {
    limits: { fileSize: 128 * 1024 * 1024 },
  },
  fastify_config: {
    port: 8080,
    host: "0.0.0.0",
  },
  minio_config: {
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "minioadmin",
    secretKey: "minioadmin",
  },
};
