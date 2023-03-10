'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: '2023-11-5',
        endDate: '2023-11-16'
      },
      {
        spotId: 2,
        userId: 2,
        startDate: '2023-11-1',
        endDate: '2023-12-16'
      },
      {
        spotId: 3,
        userId: 3,
        startDate: '2023-10-1',
        endDate: '2023-12-16'
      },
  ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    return queryInterface.bulkDelete(options, {
      spotId:  [1, 2, 3]
    }, {});
  }
};