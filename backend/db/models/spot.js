'use strict';
/** @type {import('sequelize-cli').Migration} */
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      })

      Spot.hasMany(models.Spotimage, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      })

      Spot.belongsTo(models.User, {
         foreignKey: 'ownerId',
         as: 'Owner'
         })
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull:false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Spot',
    defaultScope: {
      attributes: {
        include: [
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('createdAt')), 'createdAt'],
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('updatedAt')), 'updatedAt']
        ]
      }
    }
  });
  return Spot;
};