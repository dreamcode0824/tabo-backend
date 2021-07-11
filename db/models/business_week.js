const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const BusinessWeek = sequelize.define('business_week', {

    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    mon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mon_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mon_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tue_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tue_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wed_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wed_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thu_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thu_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fri_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fri_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sat_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sat_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sun: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sun_start: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sun_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mon_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    mon_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    tue_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    tue_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    wed_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    wed_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    thu_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    thu_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    fri_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    fri_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    sat_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    sat_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    sun_start_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
    sun_end_break: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true,
    },
  }, Object.assign({ timestamps: false }, defaultOptions));

  BusinessWeek.associate = (models) => {

    BusinessWeek.belongsTo(models.business, {
      foreignKey: 'business_id'
    });

  };

  return BusinessWeek;
};
