/* eslint global-require: "error" */
/* eslint-env es6 */
// eslint-disable-next-line global-require

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../../config/logger");

const basename = path.basename(__filename);
const config = {};
const db = {};

config.username = process.env.SQL_DB_USER_NAME || "root";
config.password = process.env.SQL_DB_USER_PASSWORD || "12345678";
config.database = process.env.SQL_DB_NAME || "local";
config.host = process.env.SQL_DB_HOST || "127.0.0.1";
// config.define = {
//   charset: 'utf8',
//   collate: 'utf8_unicode_ci',
// };

if (process.env.NODE_ENV == "development") {
  config.dialect = "sqlite";
  config.storage = ":memory:";
} else {
  config.dialect = "mysql";
}

config.pool = {
  max: 100,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    // eslint-disable-next-line
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize
  .sync()
  .then(() => {
    logger.info("Sequelize is connecting Successfully");
  })
  .catch((error) => {
    logger.error("[sequelize][@app.js]", error);
  });

module.exports = {
  sequelize,
  User: db.users,
};
