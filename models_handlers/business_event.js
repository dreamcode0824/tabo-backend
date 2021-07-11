module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                // if (context.user && context.user.type === 'customer') {
                //     findOptions.where.customer = [['beach_menu_category_id', 'asc']];
                // }
                // console.log(findOptions);
                if (findOptions.where) {
                    const { location, ...whereOptions } = findOptions.where;
                    findOptions.where = whereOptions;
                    // console.log({location});
                }

                return findOptions;
            },
        },
    }
};
