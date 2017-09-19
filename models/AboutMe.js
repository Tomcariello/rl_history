'use strict';
module.exports = function(sequelize, DataTypes) {
  var AboutMe = sequelize.define('AboutMe', {
    header: DataTypes.STRING,
    elementtext: DataTypes.STRING,
    elementimage: DataTypes.STRING,
    elementtextposition: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return AboutMe;
};