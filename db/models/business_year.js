const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const BusinessYear = sequelize.define('business_year', {

    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    start: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    end: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    closed_days: {
      type: DataTypes.JSON,
      defaultValue: null,
      allowNull: true,
    },
  }, Object.assign({ timestamps: false }, defaultOptions));

  BusinessYear.associate = (models) => {

    BusinessYear.belongsTo(models.business, {
      foreignKey: 'business_id'
    });

  };

  return BusinessYear;
};
