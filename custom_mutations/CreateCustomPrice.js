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

const priceItem = new GraphQLInputObjectType({
  name: 'priceItem',
  fields: {
    id: { type: GraphQLInt },
    price: {
      type: new GraphQLInputObjectType({
        name: 'prices',
        fields: {
          monday: { type: GraphQLInt },
          tuesday: { type: GraphQLInt },
          wednesday: { type: GraphQLInt },
          thursday: { type: GraphQLInt },
          friday: { type: GraphQLInt },
          saturday: { type: GraphQLInt },
          sunday: { type: GraphQLInt },
        }
      })
    },
    type: { type: GraphQLString },
    seat_count: { type: GraphQLInt },
    zone_id: { type: GraphQLInt },
    business_id: { type: GraphQLInt },
    element_id: { type: GraphQLInt },
    start_date: { type: GraphQLString },
    end_date: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'CreateCustomPriceInput',
  fields: {
    list: {
      type: new GraphQLList(priceItem)
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
    name: 'CreateCustomPrice',
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
    const priceItems = input.list.map(item => {
      return item;
    });
    try {
      priceItems.map(async (list, index) => {
        const resultFind = await db.models.price.findAll({
          where:
          {
            zone_id: list.zone_id,
            type: list.type,
            start_date: list.start_date
          }
        });
        if (resultFind.length > 0) {
          await db.models.price.update({
            price: list.price,
            seat_count: list.seat_count,
            zone_id: list.zone_id,
            business_id: list.business_id,
            element_id: list.element_id,
            type: list.type,
            start_date: list.start_date,
            end_date: list.end_date
          }, {
            where: {
              zone_id: list.zone_id,
              type: list.type,
              start_date: list.start_date,
            }
          });
        } else {
          await db.models.price.create({
            price: list.price,
            seat_count: list.seat_count,
            zone_id: list.zone_id,
            business_id: list.business_id,
            element_id: list.element_id,
            type: list.type,
            start_date: list.start_date,
            end_date: list.end_date
          })
        }
      })
      delay(1000)
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
