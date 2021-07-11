module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                if (context.user && context.user.type === 'customer') {
                    // findOptions.where.customer = [['beach_menu_category_id', 'asc']];
                }
                // console.log(findOptions);
                if (context.user && context.user.type === 'client') {
                    findOptions.where = findOptions.where || {};
                    findOptions.where.client_id = context.user.id;
                }

                return findOptions;
            },
        },
    }
};
