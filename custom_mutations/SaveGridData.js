const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} = require('graphql');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const db = require('../db');
const gridDataArr = new GraphQLInputObjectType({
  name: 'GridDataName',
  fields: {
    id: { type: GraphQLInt },
    index: { type: GraphQLString },
    x: { type: GraphQLInt },
    y: { type: GraphQLInt },
    status: { type: GraphQLBoolean },
  }
});
const dayArr = new GraphQLInputObjectType({
  name: 'DateName',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
    grid_arr: {
      type: new GraphQLList(gridDataArr)
    },
  }
});
const type = new GraphQLInputObjectType({
  name: 'GridDataInput',
  fields: {
    business_id: { type: GraphQLInt },
    data: {
      type: new GraphQLList(dayArr)
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
    name: 'GridData',
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
    // console.log(input, "_-------------------->input")
    try {
      const elementGridData = await db.models.grid_data.findAll({
        where: {
          business_id: input.business_id
        }
      })
      if (elementGridData.length > 0) {
        await db.models.grid_data.update({
          data: input.data
        }, {
          where: {
            business_id: input.business_id
          }
        });
      } else {
        await db.models.grid_data.create({
          business_id: input.business_id,
          data: input.data
        })
      }
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
