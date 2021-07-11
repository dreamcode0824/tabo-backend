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
const positionArr = new GraphQLInputObjectType({
  name: 'PositionName',
  fields: {
    id: { type: GraphQLInt },
    seat_id: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'UpdateSeatPositionInput',
  fields: {
    id: { type: GraphQLInt },
    seat_position: {
      type: new GraphQLList(positionArr)
    },
  }
});
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateSeatPosition',
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
        seat_position: input.seat_position,
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
