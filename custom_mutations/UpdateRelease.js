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
const releaseArr = new GraphQLInputObjectType({
  name: 'ReleaseName',
  fields: {
    id: { type: GraphQLInt },
    release_day: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'UpdateReleaseInput',
  fields: {
    id: { type: GraphQLInt },
    released_days: {
      type: new GraphQLList(releaseArr)
    },
    reservation_status: { type: GraphQLString },
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateReleaseDays',
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
    console.log(input, "_-------------------->input")
    try {
      await db.models.reservation_beach.update({
        released_days: input.released_days,
        reservation_status: input.reservation_status
      }, {
        where: {
          id: input.id
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
