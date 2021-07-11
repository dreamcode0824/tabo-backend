const {
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLObjectType,
} = require('graphql');

const Errors = require('../helpers/errors');
const db = require('../db');

const type = new GraphQLInputObjectType({
    name: 'DeleteCustomerLikedBusiness',
    fields: {
        business_id: {
            type: GraphQLInt
        }
    }
});

module.exports = {
    type: new GraphQLObjectType({
        name: 'DeleteCustomerLikedBusinessResult',
        fields: {
            status: {
                type: GraphQLString
            },
        }
    }),
    args: {
        input: { type }
    },
    resolve: async (source, { input }, context, info) => {
        if (!context.user) {
            throw Errors.Authorization();
        }
        const { business_id } = input;

        try {
            await db.models.customer_liked_business.destroy({
                where: {
                    business_id,
                    customer_id: context.user.id
                }
            });

            return 'OK';
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
};
