
module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                if (context.user.type === 'customer') {
                    findOptions.order = [['id', 'asc']];
                }

                return findOptions;
            },
        },
    }
};
