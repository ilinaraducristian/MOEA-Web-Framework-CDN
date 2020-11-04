const Minio = require("minio");
const environment = require("./environments/environment")();

const minioClient = new Minio.Client(environment.minio_config);

function addFile(name, file) {
  return minioClient.putObject("objects", name, file, {
    "Content-Type": "application/octet-stream",
  });
}

function getFile(name) {
  return new Promise((resolve, reject) => {
    minioClient
      .getObject("objects", name)
      .then((dataStream) => {
        let data = "";
        dataStream.on("data", (chunk) => {
          data += chunk;
        });
        dataStream.on("end", () => resolve(data));
        dataStream.on("error", reject);
      })
      .catch(reject);
  });
}

function deleteFile(name) {
  return minioClient.removeObject("objects", name);
}

module.exports = {
  instance: minioClient,
  addFile,
  getFile,
  deleteFile,
};
