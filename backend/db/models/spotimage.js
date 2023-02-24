'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spotimage extends Model {
    
    static associate(models) {
      Spotimage.belongsTo(models.Spot, { foreignKey: 'spotId' })
    }
  }
  Spotimage.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Spotimage',
    defaultScope: {
      attributes: {
        include: [
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('createdAt')), 'createdAt'],
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('updatedAt')), 'updatedAt']
        ]
      }
    }
  });
  return Spotimage;
};