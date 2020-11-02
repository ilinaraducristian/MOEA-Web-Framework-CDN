const { DataTypes, Sequelize, Model } = require("sequelize");

const sequelize = new Sequelize("sqlite::memory:", {
  define: {
    freezeTableName: true,
  },
}); // Example for sqlite

/**
 * Common structure for Algorithm, Problem and ReferenceSet
 */
const CommonStructure = {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  md5: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
};

// Models

class User extends Model {
  static findByKeycloakIdAndProblemMD5(keycloakId, md5) {
    return User.findOne({
      where: {
        keycloakId,
      },
      include: [
        {
          model: Problem,
          where: {
            md5,
          },
        },
      ],
    });
  }
}

User.init(
  {
    keycloakId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "users",
  }
);

const Algorithm = sequelize.define("algorithms", CommonStructure);

const Problem = sequelize.define("problems", CommonStructure);

const ReferenceSet = sequelize.define("reference_sets", CommonStructure);

// Associations

User.belongsToMany(Problem, { through: "problem_user" });
User.belongsToMany(Algorithm, { through: "algorithm_user" });
User.belongsToMany(ReferenceSet, { through: "reference_set_user" });

Problem.belongsToMany(User, { through: "problem_user" });
Algorithm.belongsToMany(User, { through: "algorithm_user" });
ReferenceSet.belongsToMany(User, { through: "reference_set_user" });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = {
  instance: sequelize,
  User,
  Algorithm,
  Problem,
  ReferenceSet,
};
