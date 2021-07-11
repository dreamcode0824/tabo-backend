'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'element',
          'width',
          {
            type: Sequelize.INTEGER,
            allowNull: false
          }
          , { transaction: t }
        ),
        queryInterface.addColumn(
          'element',
          'height',
          {
            type: Sequelize.INTEGER,
            allowNull: false
          }
          , { transaction: t }
        ),
      ])
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('element', 'width', { transaction: t }),
        queryInterface.removeColumn('element', 'height', { transaction: t })
      ])
    })
  }
};
