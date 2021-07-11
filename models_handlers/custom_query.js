const customQueries = require('../custom_queries');

module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                // console.log({findOptions});
                const { name, ...params } = findOptions.where;
                const { limit = 5, offset = 0 } = findOptions;
                findOptions.where = { id: 1 };

                if (customQueries[name]) {
                    params.customer_id = context.user ? context.user.id : 1;
                    context._custom_query_result = await customQueries[name](params, limit, offset);
                }

                return findOptions;
            },
            after: async (result, args, context, info) => {

                return [
                    {
                        id: 1,
                        result: context._custom_query_result,
                    }
                ];
            }
        },
    }
};
