'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_week', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      business_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      mon: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      mon_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      mon_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      tue: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      tue_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      tue_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      wed: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      wed_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      wed_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      thu: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      thu_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      thu_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      fri: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      fri_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      fri_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      sat: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      sat_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      sat_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      sun: {
        type: Sequelize.ENUM('Open', 'Close'),
        defaultValue:'Open',
        allowNull: false
      },
      sun_start: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      sun_end: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('business_week');
  }
};
