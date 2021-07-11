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
const timesArr = new GraphQLInputObjectType({
  name: 'TimeArr',
  fields: {
    id: { type: GraphQLInt },
    time: { type: GraphQLString },
  }
});
const timeLine = new GraphQLInputObjectType({
  name: 'UpdateTimeLineName',
  fields: {
    id: { type: GraphQLInt },
    time_line: {
      type: new GraphQLList(timesArr)
    },
    day_name: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'UpdateTimeLineInput',
  fields: {
    id: { type: GraphQLInt },
    time_lines: {
      type: new GraphQLList(timeLine)
    },
    business_id: { type: GraphQLInt },
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateTimeLine',
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
      const timeLine = await db.models.time_line.findAll({
        where: {
          business_id: input.business_id
        }
      })
      if (timeLine.length > 0) {
        await db.models.time_line.update({
          time: input.time_lines,
        }, {
          where: {
            business_id: input.business_id
          }
        });
      } else {
        await db.models.time_line.create({
          time: input.time_lines,
          business_id: input.business_id,
          full: true
        });
      }
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
