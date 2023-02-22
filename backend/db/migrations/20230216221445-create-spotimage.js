'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Spotimages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Spots',
          key : 'id'
      },
      onDelete: 'cascade'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spotimages'
    await queryInterface.dropTable(options);
  }
};