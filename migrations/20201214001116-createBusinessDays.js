'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_day', {
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
      reason: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('business_day');
  }
};
