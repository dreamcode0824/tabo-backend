'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_year', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      business_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      year: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      start: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      end: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true
      },
      start_hour: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      end_hour: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('business_years');
  }
};
