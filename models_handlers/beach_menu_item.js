
module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                if (context.user.type === 'customer') {
                    findOptions.order = [['beach_menu_category_id', 'asc']];
                }

                return findOptions;
            },
        },
    }
};
