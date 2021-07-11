const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const GeneralCoupon = sequelize.define('general_coupons', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    coupon: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, Object.assign({}, defaultOptions));

  GeneralCoupon.associate = (models) => {


  };

  return GeneralCoupon;
};
