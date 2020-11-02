const fastify = require("fastify")();
const fp = require("fastify-file-upload");
const environment = require("./environments/environment");
// const {
//   instance,
//   User,
//   Algorithm,
//   Problem,
//   ReferenceSet,
// } = require("./sequelize");

const authorization_hook = require("./authorization-hook")(
  environment.authentication_issuer_url,
  environment.secureRoutes
);

// onRequest hooks
fastify.addHook("onRequest", authorization_hook);

// preValidation hooks
fastify.register(fp, {
  limits: { fileSize: 128 * 1024 * 1024 },
});

// routes
fastify.register(require("./routes/problem"));

const start = async () => {
  try {
    await fastify.listen(8080, "0.0.0.0");
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
