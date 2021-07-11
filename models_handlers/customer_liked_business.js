const Errors = require('../helpers/errors');
const db = require('../db');

module.exports = (model) => {
    return {
        model,
        create: {
            before: async (source, { customer_liked_business }, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }

                customer_liked_business.customer_id = context.user.id;

                const existing = await db.models.customer_liked_business.findOne({
                    where: {
                        customer_id: customer_liked_business.customer_id,
                        business_id: customer_liked_business.business_id,
                    }
                });
                if (existing) {
                    throw new Error(`You've already liked this item`);
                }

                return customer_liked_business;
            },
        },
    }
};
