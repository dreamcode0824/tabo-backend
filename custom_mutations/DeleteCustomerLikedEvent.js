const {
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLObjectType,
} = require('graphql');

const Errors = require('../helpers/errors');
const db = require('../db');

const type = new GraphQLInputObjectType({
    name: 'DeleteCustomerLikedEvent',
    fields: {
        event_id: {
            type: GraphQLInt
        }
    }
});

module.exports = {
    type: new GraphQLObjectType({
        name: 'DeleteCustomerLikedEventResult',
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
        const { event_id } = input;

        try {
            await db.models.customer_liked_event.destroy({
                where: {
                    event_id,
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
