const Errors = require('../helpers/errors');
const db = require('../db');

module.exports = (model) => {
  return {
    model,
    actions: ['list', 'create', 'count'],
    before: async (source, { all_coupon }, context, info) => {
      const existing = await db.models.all_coupon.findOne({
        where: {
          business_id: plan_changes.business_id,
          code: all_coupon.code
        }
      });
      if (existing) {
        throw Errors.PlanSaveInvalid();
      }
      if (!all_coupon.value) all_coupon.value = 100;
      return plan_changes;
    },
  }
};
