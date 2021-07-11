const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const BusinessDay = sequelize.define('business_day', {

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
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },


  }, Object.assign({timestamps: false}, defaultOptions));

  BusinessDay.associate = (models) => {

    BusinessDay.belongsTo(models.business, {
      foreignKey: 'business_id'
    });

  };

  return BusinessDay;
};
