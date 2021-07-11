const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const ValidatedCoupon = sequelize.define('validated_coupons', {

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
    value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },

  }, Object.assign({
    timestamps: false,
    hooks: {
      beforeCreate: function (validatedCoupon, options, fn) {
        validatedCoupon.createdAt = new Date();
        validatedCoupon.updatedAt = new Date();
        // fn(null, validatedCoupon);
      }
    }
  }, defaultOptions));

  ValidatedCoupon.associate = (models) => {

    ValidatedCoupon.belongsTo(models.all_coupons, {
      foreignKey: 'coupon_id'
    });

    ValidatedCoupon.belongsTo(models.business, {
      foreignKey: 'business_id'
    });
  };

  return ValidatedCoupon;
};
