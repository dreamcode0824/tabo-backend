const {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLObjectType,
    GraphQLInt,
} = require('graphql');
const bcrypt = require('bcrypt');

const db = require('../db');
const authHelper = require('../helpers/auth');

const type = new GraphQLInputObjectType({
    name: 'CustomerSocialLogin',
    fields: {
        type: {
            type: GraphQLString
        },
        id: {
            type: GraphQLString
        },
    }
});

module.exports = {
    type: new GraphQLObjectType({
        name: 'CustomerSocialLoginResult',
        fields: {
            token: {
                type: GraphQLString
            },
            id: {
                type: GraphQLInt
            },
            first_name: {
                type: GraphQLString
            },
            last_name: {
                type: GraphQLString
            },
            email: {
                type: GraphQLString
            },
            phone: {
                type: GraphQLString
            },
            photo: {
                type: GraphQLString
            },
            language: {
                type: GraphQLString
            },
            city_id: {
                type: GraphQLInt
            },
            country_id: {
                type: GraphQLInt
            },
        }
    }),
    args: {
        input: {type}
    },
    resolve: async (source, {input}, context, info) => {
        const {
            type,
            id,
        } = input;

        if (!type || !id) {
            throw new Error('All fields are required');
        }
        if (['facebook', 'google'].indexOf(type) === -1) {
            throw new Error('Type can be facebook or google');
        }

        try {
            const where = {};
            if (type === 'facebook') {
                where.facebook_user_id = id;
            } else
            if (type === 'google') {
                where.google_user_id = id;
            }

            let customer = await db.models.customer.findOne({
                where,
                attributes: [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'photo',
                    'language',
                    'city_id',
                    'country_id',
                ],
            });
            if (!customer) {
                throw new Error('Wrong credentials');
            }
            customer = customer.toJSON();
            const token = authHelper.createToken(customer);

            return { token, ...customer };
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
};
