'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reviewimage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reviewimage.belongsTo(models.Review, { foreignKey: 'reviewId' })
    }
  }
  Reviewimage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Reviewimage',
    defaultScope: {
      attributes: {
        include: [
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('createdAt')), 'createdAt'],
          [sequelize.fn('strftime', '%Y-%m-%d %H:%M:%S', sequelize.col('updatedAt')), 'updatedAt']
        ]
      }
    }
  });
  return Reviewimage;
};