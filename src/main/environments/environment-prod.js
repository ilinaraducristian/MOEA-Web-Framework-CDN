module.exports = environment = {
  production: true,
  authentication_issuer_url: process.env.AUTHENTICATION_ISSUER_URL,
  secureRoutes: [".+"],
  file_upload_config: {
    limits: { fileSize: 128 * 1024 * 1024 },
  },
  fastify_config: {
    port: parseInt(process.env.PORT),
    host: process.env.HOST,
  },
  minio_config: {
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  },
  postgresql_url: process.env.POSTGRESQL_URL,
};
