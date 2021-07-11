const Errors = require('../helpers/errors');

module.exports = (model) => {
    return {
        model,
        create: {
            before: async (source, { customer_liked_event }, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }

                customer_liked_event.customer_id = context.user.id;

                return customer_liked_event;
            },
        },
    }
};
