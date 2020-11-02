const fs = require("fs").promises;
const { instance, User, Problem } = require("../sequelize");
const environment = require("../environments/environment");

fs.access("asd.pls")
  .then((v) => {
    console.log(v);
  })
  .catch((e) => {
    console.log(e);
  });

module.exports = function (fastify, opts, next) {
  fastify.post("/problem", addProblemHandlerTest);
  fastify.get("/problem/:md5", getProblemHandlerTest);
  fastify.delete("/problem/:md5", deleteProblemHandler);
  next();
};

let firstTime = true;

async function addProblemHandlerTest(req, res) {
  if (firstTime) {
    await instance.sync();
    await User.create({ keycloakId: "id1" });
    firstTime = false;
  }
  req.jwt = { sub: "id1" };
  await addProblemHandler(req, res);
}

async function addProblemHandler(req, res) {
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
        // get user by keycloakId and check if he has access to the problem
        const userWithProblem = await User.findByKeycloakIdAndProblemMD5(
          keycloakId,
          file.md5
        );

        // get the user again
        const user = await User.findOne({ where: { keycloakId } });

        // if the user already has the problem then return
        if (userWithProblem !== null) {
          return `file_exists ${file.md5}`;
        }

        // check if the problem exists
        let problem = await Problem.findOne({
          where: {
            md5: file.md5,
          },
        });

        // if the problem doesn't exist, create it
        if (problem === null) {
          problem = await Problem.create({
            name: file.name,
            md5: file.md5,
          });

          // check if the file exists on the disk
          try {
            await fs.access(`${environment.data_path}/${file.md5}`);
          } catch (e) {
            if (e.code !== "ENOENT") {
              return res.status(500).send();
            }
            // after creating the db entry, store it on the disk if it's not already there
            await fs.writeFile(
              `${environment.data_path}/${file.md5}`,
              file.data
            );
          }
        }

        // add the problem to the user
        await user.addProblem(problem);

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
    // check if the problem was added to the user or something went wrong
    if (promise.status === "fulfilled") {
      // if the problem exists or it was created
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

async function getProblemHandlerTest(req, res) {
  if (firstTime) {
    await instance.sync();
    await User.create({ keycloakId: "id1" });
    firstTime = false;
  }
  const md5 = req.params.md5;
  const keycloakId = "id1";

  if (md5.length === 0) {
    return res.status(400).send();
  }
  const user = await User.findByKeycloakIdAndProblemMD5(keycloakId, md5);

  if (user === null) {
    return res.status(404).send();
  }

  res.send(await fs.readFile(`${environment.data_path}/${md5}`));
}

async function getProblemHandler(req, res) {
  const md5 = req.params.md5;
  const keycloakId = req.jwt.sub;

  if (md5.length === 0) {
    return res.status(400).send();
  }
  const user = await User.findByKeycloakIdAndProblemMD5(keycloakId, md5);

  if (user === null) {
    return res.status(404).send();
  }

  res.send(await fs.readFile(`${environment.data_path}/${md5}`));
}

async function deleteProblemHandler(req, res) {
  const md5 = req.params.md5;
  const keycloakId = req.jwt.sub;

  if (md5.length === 0) {
    return res.status(400).send();
  }
  const user = await User.findByKeycloakIdAndProblemMD5(keycloakId, md5);

  if (user === null) {
    return res.status(404).send();
  }

  res.send();
}

async function deleteProblemHandler(req, res) {}
