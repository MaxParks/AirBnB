'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: "123 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        // lat: 37.7645358,
        // lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123,
      },
      {
        ownerId: 2,
        address: "456 Universal Way",
        city: "San Diego",
        state: "California",
        country: "United States of America",
        // lat: 40.7645358,
        // lng: -100.4730327,
        name: "Universal Studios",
        description: "Place where joy is made",
        price: 99,
      },
      {
        ownerId: 3,
        address: "880 Hampshire Road",
        city: "LA",
        state: "California",
        country: "United States of America",
        // lat: 20.7645358,
        // lng: -10.4730327,
        name: "Elite MMA",
        description: "Where pain is found",
        price: 250,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['App Academy','Universal Studios','Elite MMA'] }
    }, {});
  }
};