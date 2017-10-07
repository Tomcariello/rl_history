'use strict';
module.exports = function(sequelize, DataTypes) {
  var Research = sequelize.define('Research', {
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
  return Research;
};