'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spotimages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: 'www.google.com/1',
        preview: true,
      },
      {
        spotId: 2,
        url: 'www.google.com/2',
        preview: true,
      },
      {
        spotId: 3,
        url: 'www.google.com/3',
        preview: true,
      },
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spotimages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['www.google.com/1','www.google.com/2','www.google.com/3'] }
    }, {});
  }
};
