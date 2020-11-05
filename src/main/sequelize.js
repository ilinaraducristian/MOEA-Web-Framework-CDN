const { DataTypes, Sequelize, Model } = require("sequelize");
const environment = require("./environments/environment")();

let sequelize;

if (environment.production) {
  sequelize = new Sequelize(environment.postgresql_url, {
    define: {
      freezeTableName: true,
    },
  });
} else {
  sequelize = new Sequelize("sqlite::memory:", {
    define: {
      freezeTableName: true,
    },
  });
}

// Common structure for Algorithm, Problem and ReferenceSet
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
  static findByKeycloakIdAndModelMD5(model, keycloakId, md5) {
    return User.findOne({
      where: {
        keycloakId,
      },
      include: [
        {
          model,
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
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "user_entity",
    timestamps: false,
  }
);

const Algorithm = sequelize.define("algorithms", CommonStructure, {
  timestamps: false,
});

const Problem = sequelize.define("problems", CommonStructure, {
  timestamps: false,
});

const ReferenceSet = sequelize.define("reference_sets", CommonStructure, {
  timestamps: false,
});

// Associations

User.belongsToMany(Problem, { through: "problem_user" });
User.belongsToMany(Algorithm, { through: "algorithm_user" });
User.belongsToMany(ReferenceSet, { through: "reference_set_user" });

Problem.belongsToMany(User, { through: "problem_user" });
Algorithm.belongsToMany(User, { through: "algorithm_user" });
ReferenceSet.belongsToMany(User, { through: "reference_set_user" });

const isConnected = sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    return Promise.resolve(true);
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    return Promise.resolve(false);
  });

module.exports = {
  instance: sequelize,
  isConnected,
  User,
  Algorithm,
  Problem,
  ReferenceSet,
};
