const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {
  const Reservation_restaurant = sequelize.define('reservation_restaurant', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    element_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    qr_code: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    selected_day: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reservation_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    business_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.STRING,
    },
    arrive_time: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    number_persons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    time_occupied: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    customer_lated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    end_day_hrs: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
  }, Object.assign({}, defaultOptions));
  Reservation_restaurant.associate = (models) => {
    Reservation_restaurant.belongsTo(models.business, {
      foreignKey: 'business_id'
    });
  };
  return Reservation_restaurant;
};
