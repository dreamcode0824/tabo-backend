
module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                if (args.where && args.where.name && args.where.name.length > 2) {
                    findOptions.where.name = {
                        $like: args.where.name+'%'
                    };
                }

                return findOptions;
            },
        },
    }
};
