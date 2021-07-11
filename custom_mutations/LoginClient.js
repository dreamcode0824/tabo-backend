const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
} = require('graphql');

const db = require('../db');
const authHelper = require('../helpers/auth');
const { clientObjectType } = require('../schemas/client');
const type = new GraphQLInputObjectType({
  name: 'LoginClient',
  fields: {
    email: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    }
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'LoginClientResult',
    fields: {
      token: {
        type: GraphQLString
      },
      result: {
        type: clientObjectType
      }
    }
  }),
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    const { email, password } = input;
    try {
      console.log(input)
      const client = await db.models.client.findOne({
        where: {
          email,
        }
      });

      if (client) {
        if (await authHelper.verifyPassword(password, client.password)) {
          const user = client.toJSON();
          if (user.status === 'Accept') {
            user.type = 'client';
            const token = authHelper.createToken(user);
            return { token, result: user };
          }
          throw new Error('Non approved');
        }

        throw new Error('Wrong email or password');
      }

      throw new Error('Wrong email or password');
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
