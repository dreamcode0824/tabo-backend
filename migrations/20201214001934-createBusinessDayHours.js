'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_day_hour', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      business_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      pick_date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false
      },
      start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('business_day_hour');
  }
};
