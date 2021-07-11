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
const closeDayArr = new GraphQLInputObjectType({
  name: 'ClosedDays',
  fields: {
    id: { type: GraphQLInt },
    closed_day: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'ClosedDaysInput',
  fields: {
    id: { type: GraphQLInt },
    closed_days: {
      type: new GraphQLList(closeDayArr)
    },
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateClosedDays',
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
      const buisnessYear = await db.models.business_year.findOne({
        where: {
          business_id: input.id
        }
      });
      if (buisnessYear) {
        await db.models.business_year.update({
          business_id: input.id,
          closed_days: input.closed_days,
          year: 2021
        }, {
          where: {
            business_id: input.id
          }
        });
      } else {
        await db.models.business_year.create({
          business_id: input.id,
          closed_days: input.closed_days,
          year: 2021
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
