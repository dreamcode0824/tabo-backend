'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'business_settings',
          'umbrella_required',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }
          , { transaction: t }
        ),
      ])
    })
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('business_settings', 'umbrella_required', { transaction: t }),
      ])
    })
  }
};
