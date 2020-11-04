module.exports = function () {
  if (process.env.ENV === "prod") return require("./environment-prod");
  else return require("./environment-dev");
};
