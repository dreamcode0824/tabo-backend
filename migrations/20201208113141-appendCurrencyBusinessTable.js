'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'business',
          'currency',
          {
            type: Sequelize.STRING,
            defaultValue:'USD',
            allowNull: false
          }
          , { transaction: t }
        ),
        queryInterface.addColumn(
          'business',
          'location_name',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
          , { transaction: t }
        ),
      ])
    })    

},

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('business', 'currency', { transaction: t }),
        queryInterface.removeColumn('business', 'location_name', { transaction: t })
      ])
    })    

  }
};
