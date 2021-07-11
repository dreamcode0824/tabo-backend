const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const Reservation_beach = sequelize.define('reservation_beach', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    element_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    seat_position: {
      type: DataTypes.JSON,
      allowNull: false
    },
    additional_sunbed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rent_umbrella: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    protocol_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    selected_days: {
      type: DataTypes.JSON,
      allowNull: false
    },
    qr_code: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    paid_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // reservation_status: {
    //   type: DataTypes.ENUM,
    //   values: ['pending', 'reserved_paid', 'reserved_not_paid', 'occupied', 'cancel', 'completed', 'rejected']
    // },
    reservation_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    price_values: {
      type: DataTypes.JSON,
      allowNull: false
    },
    coupon_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completed: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    released_days: {
      type: DataTypes.JSON,
      allowNull: false
    },
    changed_position: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    time_zone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    changed_reservation: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
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
    accepted_by: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    rejected_by: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    canceled_by: {
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
    day_price: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    day_price: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rent_umbrella_price: {
      type: DataTypes.JSON,
      allowNull: false
    },
    extra_sunbed_price: {
      type: DataTypes.JSON,
      allowNull: false
    },
    customer_request: {
      type: DataTypes.JSON,
      allowNull: true
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arrive_time: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    end_days_hrs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
  }, Object.assign({}, defaultOptions));
  Reservation_beach.associate = (models) => {

    Reservation_beach.belongsTo(models.business, {
      foreignKey: 'business_id'
    });
  };
  return Reservation_beach;
};
