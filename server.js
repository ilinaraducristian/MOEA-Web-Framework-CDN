const fs = require("fs").promises;
const fastify = require("fastify")();
const fileUpload = require("fastify-file-upload");

fastify.register(fileUpload);

fs.mkdir("/usr/content").catch(() => {});

fastify.post("/", async (req, res) => {
  const files = req.raw.files;
  const promises = [];
  for (let key in files) {
    promises.push(
      fs.writeFile(`/usr/content/${files[key].name}`, files[key].data)
    );
  }
  if (promises.length == 0) {
    return { statusCode: 400, message: "No file provided" };
  }
  return Promise.all(promises)
    .then(() => {
      return { statusCode: 200 };
    })
    .catch((e) => {
      console.log(e);
      return { statusCode: 400 };
    });
});

fastify.get("/:filename", async (req, res) => {
  return fs
    .readFile(`/usr/content/${req.params.filename}`)
    .then((value) => {
      res.code(200).send(value);
      // return
    })
    .catch((e) => {
      console.log(e);
      return { statusCode: 400 };
    });
});

fastify.delete("/:filename", async (req, res) => {
  return fs
    .unlink(`/usr/content/${req.params.filename}`)
    .then(() => {
      return { statusCode: 200 };
    })
    .catch((e) => {
      console.log(e);
      return { statusCode: 404 };
    });
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
