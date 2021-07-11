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
  name: 'ReservationName',
  fields: {
    id: { type: GraphQLInt },
    release_day: { type: GraphQLString },
  }
});
const ruPriceDaysArr = new GraphQLInputObjectType({
  name: 'ruPrices',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
    price: { type: GraphQLInt },
  }
});
const ebPriceDaysArr = new GraphQLInputObjectType({
  name: 'ebPrices',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
    price: { type: GraphQLInt },
  }
});
const priceValues = new GraphQLInputObjectType({
  name: 'SeatPrice',
  fields: {
    id: { type: GraphQLString },
    seat_position: { type: GraphQLString },
    each_day: { type: GraphQLString },
    price_values: { type: GraphQLInt },
  }
});
const positionArr = new GraphQLInputObjectType({
  name: 'Seats',
  fields: {
    id: { type: GraphQLInt },
    seat_id: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'UpdateReservationInput',
  fields: {
    id: { type: GraphQLInt },
    rent_umbrella_price: {
      type: new GraphQLList(ruPriceDaysArr)
    },
    extra_sunbed_price: {
      type: new GraphQLList(ebPriceDaysArr)
    },
    price_values: {
      type: new GraphQLList(priceValues)
    },
    additional_sunbed: { type: GraphQLInt },
    rent_umbrella: { type: GraphQLInt },
    total_price: { type: GraphQLInt },
    position_seats: {
      type: new GraphQLList(positionArr)
    },
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateReservation',
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
        rent_umbrella_price: input.rent_umbrella_price,
        extra_sunbed_price: input.extra_sunbed_price,
        price_values: input.price_values,
        additional_sunbed: input.additional_sunbed,
        rent_umbrella: input.rent_umbrella,
        seat_position: input.position_seats,
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
