'use strict';
module.exports = function(sequelize, DataTypes) {
  var Events = sequelize.define('Events', {
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
  return Events;
};