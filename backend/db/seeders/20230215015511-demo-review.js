'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        review: "This was an awesome spot!",
        stars: 5
      },
      {
        spotId: 2,
        userId: 2,
        review: "This place was bad",
        stars: 2
      },
      {
        spotId: 3,
        userId: 3,
        review: "Nice vacation place!",
        stars: 4
      }
    ], {});
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

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['This was an awesome spot!','This place was bad','Nice vacation place!'] }
    }, {});
  }
};
