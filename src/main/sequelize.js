const { DataTypes, Sequelize, Model } = require("sequelize");
const environment = require("./environments/environment")();

let sequelize;

if (environment.production) {
  sequelize = new Sequelize(environment.postgresql_url, {
    logging: false,
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

const CommonOptions = {
  underscored: true,
  timestamps: false,
};

// Models
class User extends Model {
  static findByKeycloakIdAndModelMD5(model, keycloakId, md5) {
    return User.findOne({
      where: {
        id: keycloakId,
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
    underscored: true,
    timestamps: false,
  }
);

const Algorithm = sequelize.define(
  "algorithms",
  CommonStructure,
  CommonOptions
);

const Problem = sequelize.define("problems", CommonStructure, CommonOptions);

const ReferenceSet = sequelize.define(
  "reference_sets",
  CommonStructure,
  CommonOptions
);

// Associations

User.belongsToMany(Problem, { through: "problem_user", timestamps: false });
User.belongsToMany(Algorithm, { through: "algorithm_user", timestamps: false });
User.belongsToMany(ReferenceSet, {
  through: "reference_set_user",
  timestamps: false,
});

Problem.belongsToMany(User, { through: "problem_user" });
Algorithm.belongsToMany(User, { through: "algorithm_user" });
ReferenceSet.belongsToMany(User, { through: "reference_set_user" });

let isConnected = false;
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    isConnected = true;
    return sequelize.sync();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    isConnected = false;
  });

module.exports = {
  instance: sequelize,
  isConnected,
  User,
  Algorithm,
  Problem,
  ReferenceSet,
};
