'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviewimages';
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: 'www.google.com/1'
      },
      {
        reviewId: 2,
        url: 'www.google.com/2'
      },
      {
        reviewId: 3,
        url: 'www.google.com/3'
      }
  ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviewimages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['www.google.com/1','www.google.com/2','www.google.com/3'] }
    }, {});
  }
};
