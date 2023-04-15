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
        url: 'https://www.bhg.com/thmb/H9VV9JNnKl-H1faFXnPlQfNprYw=/1799x0/filters:no_upscale():strip_icc()/white-modern-house-curved-patio-archway-c0a4a3b3-aa51b24d14d0464ea15d36e05aa85ac9.jpg',
        preview: true,
      },
      {
        spotId: 2,
        url: 'https://ap.rdcpix.com/399e65db076d5e548462ebdc27fed591l-m493598138od-w480_h360_x2.jpg',
        preview: true,
      },
      {
        spotId: 3,
        url: 'https://cdn2.lamag.com/wp-content/uploads/sites/6/2018/06/house-los-angeles-getty.jpg',
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
      url: { [Op.in]: ['https://www.bhg.com/thmb/H9VV9JNnKl-H1faFXnPlQfNprYw=/1799x0/filters:no_upscale():strip_icc()/white-modern-house-curved-patio-archway-c0a4a3b3-aa51b24d14d0464ea15d36e05aa85ac9.jpg','https://ap.rdcpix.com/399e65db076d5e548462ebdc27fed591l-m493598138od-w480_h360_x2.jpg','https://cdn2.lamag.com/wp-content/uploads/sites/6/2018/06/house-los-angeles-getty.jpg'] }
    }, {});
  }
};
