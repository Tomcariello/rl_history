'use strict';
module.exports = function(sequelize, DataTypes) {
  var Publications = sequelize.define('Publications', {
    header: DataTypes.STRING,
    elementtext: DataTypes.STRING,
    elementimage: DataTypes.STRING,
    elementtextposition: DataTypes.STRING,
    category: DataTypes.STRING,
    imagecaption: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return Publications;
};