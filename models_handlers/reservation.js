module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                if (context.user) {
                    findOptions.where = findOptions.where || {};

                    if (context.user.type === 'customer') {
                        findOptions.where.customer_id = context.user.id;
                    } else
                        if (context.user.type === 'client') {
                            findOptions.where.client_id = context.user.id;
                        }
                }

                // console.log(findOptions);
                return findOptions;
            },
        },
    }
};
