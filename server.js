const fs = require("fs").promises;
const fastify = require("fastify")();
const fileUpload = require("fastify-file-upload");

const authentication_issuer_url =
  process.env.AUTHENTICATION_ISSUER_URL ||
  "http://localhost:8180/auth/realms/MOEA-Web-Framework";
const data_path = process.env.DATA_PATH || "/usr/content";
const secureRoutes = ["^/[A-Fa-f0-9]{64}$"];

const authorization_hook = require("./authorization-hook")(
  authentication_issuer_url,
  secureRoutes
);

fastify.addHook("onRequest", authorization_hook);

fastify.register(fileUpload);

fs.mkdir(data_path).catch(() => {});

fastify.post("/", async (req, res) => {
  const promises = [];
  req.raw.files.forEach((file) => {
    promises.push(fs.writeFile(`${data_path}/${file.name}`, file.data));
  });
  if (promises.length == 0) {
    return res.status(400).send("No file provided");
  }
  try {
    await Promise.all(promises);
    res.send();
  } catch (error) {
    res.status(400).send();
  }
});

fastify.get("/:filename", async (req, res) => {
  try {
    res
      .status(200)
      .send(await fs.readFile(`${data_path}/${req.params.filename}`));
  } catch (error) {
    res.status(400).send();
  }
});

fastify.delete("/:filename", async (req, res) => {
  try {
    await fs.unlink(`${data_path}/${req.params.filename}`);
    res.send();
  } catch (error) {
    res.status(400).send();
  }
});

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
