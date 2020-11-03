const sequelize = require("./sequelize");
const minio = require("./minio");

module.exports = function (model) {
  const lowercaseModel = model.toLowerCase();

  function plugin(fastify, opts, next) {
    fastify.post(`/${lowercaseModel}`, addModelHandlerTest);
    fastify.get(`/${lowercaseModel}/:md5`, getModelHandlerTest);
    fastify.delete(`/${lowercaseModel}/:md5`, deleteModelHandlerTest);
    next();
  }

  let firstTime = true;

  async function addModelHandlerTest(req, res) {
    if (firstTime) {
      await sequelize.instance.sync();
      await sequelize.User.create({ keycloakId: "id1" });
      firstTime = false;
    }
    req.jwt = { sub: "id1" };
    await addModelHandler(req, res);
  }

  async function getModelHandlerTest(req, res) {
    if (firstTime) {
      await sequelize.instance.sync();
      await sequelize.User.create({ keycloakId: "id1" });
      firstTime = false;
    }
    req.jwt = { sub: "id1" };

    await getModelHandler(req, res);
  }

  async function deleteModelHandlerTest(req, res) {
    if (firstTime) {
      await sequelize.instance.sync();
      await sequelize.User.create({ keycloakId: "id1" });
      firstTime = false;
    }
    req.jwt = { sub: "id1" };
    await deleteModelHandler(req, res);
  }

  async function addModelHandler(req, res) {
    const keycloakId = req.jwt.sub;
    const files = req.raw.files;
    const files_keys = Object.keys(files);
    if (files_keys.length == 0) {
      return res.status(400).send("No file provided");
    }
    // process all files
    const promises = await Promise.allSettled(
      // map file to promise
      files_keys.map(async (key) => {
        const file = files[key];
        try {
          // get user by keycloakId and check if he has access to the model
          const userWithModel = await sequelize.User.findByKeycloakIdAndModelMD5(
            sequelize[model],
            keycloakId,
            file.md5
          );

          // get the user again
          const user = await sequelize.User.findOne({ where: { keycloakId } });

          // if the user already has the model then return
          if (userWithModel !== null) {
            return `file_exists ${file.md5}`;
          }

          // check if the model exists
          let modelInstance = await sequelize[model].findOne({
            where: {
              md5: file.md5,
            },
          });

          // if the model doesn't exist, create it
          if (modelInstance === null) {
            modelInstance = await sequelize[model].create({
              name: file.name,
              md5: file.md5,
            });

            // check if the file exists in minio
            try {
              await minio.getFile(file.md5);
            } catch (e) {
              if (e.message !== "The specified key does not exist.") {
                throw e;
              }
              // after creating the db entry, store it in minio if it's not already there
              await minio.addFile(file.md5, file.data);
            }
          }

          // add the model to the user
          await user[`add${model}`](modelInstance);

          return `ok ${file.md5}`;
        } catch (e) {
          e.file_md5 = file.md5;
          throw e;
        }
      })
    );

    // store each file's state
    const response = [];
    promises.forEach((promise) => {
      const file = {};
      // check if the model was added to the user or something went wrong
      if (promise.status === "fulfilled") {
        // if the model exists or it was created
        const split = promise.value.split(" ");
        file.md5 = split[1];
        file.status = split[0];
      } else {
        // if something went wrong
        file.md5 = promise.reason.file_md5;
        file.status = promise.reason.message;
      }
      response.push(file);
    });

    // return which files were uploaded, which failed and if there was an internal error
    res.send(response);
  }

  async function getModelHandler(req, res) {
    const md5 = req.params.md5;
    const keycloakId = req.jwt.sub;

    if (md5.length === 0) {
      return res.status(400).send();
    }
    const user = await sequelize.User.findByKeycloakIdAndModelMD5(
      sequelize[model],
      keycloakId,
      md5
    );

    if (user === null) {
      return res.status(404).send();
    }

    try {
      res.send(await minio.getFile(md5));
    } catch (e) {
      res.status(500).send();
    }
  }

  async function deleteModelHandler(req, res) {
    const md5 = req.params.md5;
    const keycloakId = req.jwt.sub;

    if (md5.length === 0) {
      return res.status(400).send();
    }
    const user = await sequelize.User.findByKeycloakIdAndModelMD5(
      sequelize[model],
      keycloakId,
      md5
    );

    if (user === null) {
      return res.status(404).send();
    }

    res.send();
  }

  return plugin;
};
