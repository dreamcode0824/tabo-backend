const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {
  const Seat = sequelize.define('time_line', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    full: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    time: {
      type: DataTypes.JSON,
      default: null
    },

  }, Object.assign({}, defaultOptions));

  Seat.associate = (models) => {
    Seat.belongsTo(models.business, {
      foreignKey: 'business_id'
    });
  };

  return Seat;
};
