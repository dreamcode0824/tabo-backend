const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const BusinessDayHour = sequelize.define('business_day_hour', {

    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    pick_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end: {
      type: DataTypes.STRING,
      allowNull: true,
    },


  }, Object.assign({timestamps: false}, defaultOptions));

  BusinessDayHour.associate = (models) => {

    BusinessDayHour.belongsTo(models.business, {
      foreignKey: 'business_id'
    });

  };

  return BusinessDayHour;
};
