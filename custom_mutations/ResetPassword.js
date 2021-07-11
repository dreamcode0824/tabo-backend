const {
    GraphQLInputObjectType,
    GraphQLString,
} = require('graphql');
const bcrypt = require('bcrypt');

const db = require('../db');

const type = new GraphQLInputObjectType({
    name: 'ResetPassword',
    fields: {
        code: { type: GraphQLString },
        number: { type: GraphQLString },
        password: { type: GraphQLString },
    }
});

module.exports = {
    type: GraphQLString,
    args: {
        input: { type }
    },
    resolve: async (source, { input }, context, info) => {
        const phone = `+${input.code}${input.number}`;

        await db.models.customer.update({
            password: await bcrypt.hash(input.password, 10)
        }, {
            where: {
                phone,
            }
        });

        return 'OK';
    }
};
