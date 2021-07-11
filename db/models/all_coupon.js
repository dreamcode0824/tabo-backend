const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const AllCoupon = sequelize.define('all_coupons', {
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
    },

    value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },

  }, Object.assign({}, defaultOptions));

  AllCoupon.associate = (models) => {

    AllCoupon.belongsTo(models.business, {
      foreignKey: 'business_id'
    });
    AllCoupon.hasMany(models.validated_coupons, {
      as: 'businessList',
      foreignKey: 'coupon_id',
    });

  };

  return AllCoupon;
};
