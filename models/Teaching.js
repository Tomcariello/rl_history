'use strict';
module.exports = function(sequelize, DataTypes) {
  var Teaching = sequelize.define('Teaching', {
    header: DataTypes.STRING,
    elementtext: DataTypes.STRING,
    elementimage: DataTypes.STRING,
    elementtextposition: DataTypes.STRING,
    imagecaption: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return Teaching;
};