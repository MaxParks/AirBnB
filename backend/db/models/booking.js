'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'userId' })

      Booking.belongsTo(models.Spot, { foreignKey: 'userId' })
    }
  }
  Booking.init({
    spotId: {
      type: DataTypes.INTEGER
     
    },
    userId: {
      type: DataTypes.INTEGER
      
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};