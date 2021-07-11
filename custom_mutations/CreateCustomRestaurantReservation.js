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
var moment = require('moment-timezone');
const cryptoRandomString = require('crypto-random-string');
const type = new GraphQLInputObjectType({
  name: 'CreateCustomRestaurantReservationInput',
  fields: {
    element_id: { type: GraphQLInt },
    phone_number: { type: GraphQLString },
    comment: { type: GraphQLString },
    name: { type: GraphQLString },
    qr_code: { type: GraphQLString },
    business_id: { type: GraphQLInt },
    selected_day: { type: GraphQLString },
    reservation_status: { type: GraphQLString },
    business_user_id: { type: GraphQLInt },
    arrive_time: { type: GraphQLString },
    time_occupied: { type: GraphQLString },
    number_persons: { type: GraphQLInt },
    created_by: { type: GraphQLString },
  }
});
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'CreateCustomRestaurantReservation',
    fields: {
      result: {
        type: GraphQLString
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
      let uniqueString = cryptoRandomString({ length: 100, type: 'base64' });
      await db.models.reservation_restaurant.create({
        element_id: input.element_id,
        phone_number: input.phone_number,
        comment: input.comment,
        name: input.name,
        qr_code: uniqueString,
        business_id: input.business_id,
        customer_id: 44,
        selected_day: input.selected_day,
        reservation_status: input.reservation_status,
        business_user_id: input.business_user_id,
        arrive_time: input.arrive_time,
        time_occupied: input.time_occupied,
        number_persons: input.number_persons,
        created_by: input.created_by,
      })
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
