const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} = require('graphql');

const db = require('../db');

const type = new GraphQLInputObjectType({
  name: 'DeleteCustomPriceInput',
  fields: {
    business_id: { type: GraphQLInt }
  },
});
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'DeleteCustomPrice',
    fields: {
      result: {
        type: GraphQLString
        // type:new GraphQLList(GraphQLInt)
        // type: new GraphQLList(GraphQLString)
      }
    }
  }),
  description:
    'Enable or disable a group for the current user.',
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    try {
      await db.models.price.destroy({
        where:
        {
          business_id: input.business_id,
        }
      });
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
