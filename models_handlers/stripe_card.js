module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                // if (context.user && context.user.type === 'customer') {
                //     findOptions.where.customer = [['beach_menu_category_id', 'asc']];
                // }
                // console.log(findOptions);
                // console.log('context.user.id', context.user.id);

                return findOptions;
            },
        },
    }
};
