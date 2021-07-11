'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'client',
          'first_name',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
          , { transaction: t }
        ),
        queryInterface.addColumn(
          'client',
          'last_name',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
          , { transaction: t }
        ),
        queryInterface.addColumn(
          'client',
          'position',
          {
            type: Sequelize.ENUM('Owner', 'Administrator', 'Company Representative', 'Manager'),
            defaultValue:'Owner'
          }
          , { transaction: t }
        ),        
        queryInterface.addColumn(
          'client',
          'status',
          {
            type: Sequelize.ENUM('Pending', 'Accept', 'Suspended', 'Reject'),
            defaultValue:'Pending'
          }
          , { transaction: t }
        ),        
      ])
    })    
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('client', 'first_name', { transaction: t }),
          queryInterface.removeColumn('client', 'last_name', { transaction: t }),
          queryInterface.removeColumn('client', 'position', { transaction: t }),
          queryInterface.removeColumn('client', 'status', { transaction: t })
      ])
    })    
  }
};
