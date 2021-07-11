const Errors = require('../helpers/errors');
const db = require('../db');

module.exports = (model) => {
  return {
    model,
    actions: ['list', 'count'],
    create: {
      before: async (source, { validated_coupon }, context, info) => {
        const existing = await db.models.all_coupon.findOne({
          where: {
            id: validated_coupon.coupon_id,
          }
        });
        if (!existing) {
          throw Errors.CouponInvalid();
        }
        // const validateCoupon = await db.models.validated_coupon.findOne({
        //   where: {
        //     coupon_id: validated_coupon.coupon_id
        //   }
        // })
        const existingValidateCoupon = await db.models.validated_coupon.findOne({
          where: {
            coupon_id: validated_coupon.coupon_id,
            business_id: validated_coupon.business_id
          }
        })
        if (existing && existingValidateCoupon) {
          throw Errors.CouponExistingInvalid();
        }
        if (existing && existing.type == 'individual' && (existing.business_id != validated_coupon.business_id)) {
          throw Errors.CouponInvalid();
        }
        return validated_coupon;
      },
    }
  }
};
