const fastify = require("fastify")();
const fp = require("fastify-file-upload");
const environment = require("./environments/environment");
const createRoute = require("./route-creator");

const authorization_hook = require("./authorization-hook")(
  environment.authentication_issuer_url,
  environment.secureRoutes
);

// onRequest hooks
fastify.addHook("onRequest", authorization_hook);

// preValidation hooks
fastify.register(fp, environment.file_upload_config);

// routes
fastify.register(createRoute("Problem"));
fastify.register(createRoute("Algorithm"));
fastify.register(createRoute("ReferenceSet"));

const start = async () => {
  try {
    await fastify.listen(environment.fastify_config);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
