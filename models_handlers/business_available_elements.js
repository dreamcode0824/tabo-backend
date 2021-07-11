const db = require('../db');

module.exports = (model) => {
    return {
        model,

        list: {
            before: async (findOptions, args, context, info) => {
                console.log('context.user.type', context.user.type);
                if (context.user.type === 'customer') {
                    findOptions.group = 'element_id';
                }

                return findOptions;
            },
            after: async (result, args, context, info) => {

                if (context.user.type === 'customer') {
                    // console.log(result.length);
                }
                // console.log(result);
                return result
            }
        },
    }
};
