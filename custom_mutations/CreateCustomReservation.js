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
const priceValues = new GraphQLInputObjectType({
  name: 'SeatPriceItem',
  fields: {
    id: { type: GraphQLString },
    seat_position: { type: GraphQLString },
    each_day: { type: GraphQLString },
    price_values: { type: GraphQLInt },
  }
});
const positionArr = new GraphQLInputObjectType({
  name: 'Positions',
  fields: {
    id: { type: GraphQLInt },
    seat_id: { type: GraphQLString },
  }
});
const selectedDaysArr = new GraphQLInputObjectType({
  name: 'SelectDays',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
  }
});
const ruPriceDaysArr = new GraphQLInputObjectType({
  name: 'ruPrice',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
    price: { type: GraphQLInt },
  }
});
const ebPriceDaysArr = new GraphQLInputObjectType({
  name: 'ebPrice',
  fields: {
    id: { type: GraphQLInt },
    day: { type: GraphQLString },
    price: { type: GraphQLInt },
  }
});
const endDayHourArr = new GraphQLInputObjectType({
  name: 'endDayHour',
  fields: {
    id: { type: GraphQLInt },
    hour: { type: GraphQLString },
  }
})
const type = new GraphQLInputObjectType({
  name: 'CreateCustomReservationInput',
  fields: {
    price_values_arr: {
      type: new GraphQLList(priceValues)
    },
    position_seats: {
      type: new GraphQLList(positionArr)
    },
    selected_days: {
      type: new GraphQLList(selectedDaysArr)
    },
    rent_umbrella_price: {
      type: new GraphQLList(ruPriceDaysArr)
    },
    extra_sunbed_price: {
      type: new GraphQLList(ebPriceDaysArr)
    },
    end_days_hours: {
      type: new GraphQLList(endDayHourArr)
    },
    element_count: { type: GraphQLInt },
    additional_sunbed: { type: GraphQLInt },
    protocol_status: { type: GraphQLBoolean },
    phone_number: { type: GraphQLString },
    comment: { type: GraphQLString },
    name: { type: GraphQLString },
    qr_code: { type: GraphQLString },
    paid_online: { type: GraphQLBoolean },
    reservation_status: { type: GraphQLString },
    coupon_number: { type: GraphQLInt },
    discount_amount: { type: GraphQLInt },
    completed: { type: GraphQLString },
    released_days: { type: GraphQLString },
    changed_position: { type: GraphQLString },
    business_id: { type: GraphQLInt },
    time_zone: { type: GraphQLString },
    changed_reservation: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    accepted_by: { type: GraphQLString },
    rejected_by: { type: GraphQLString },
    canceled_by: { type: GraphQLString },
    start_date: { type: GraphQLString },
    qr_code: { type: GraphQLString },
    end_date: { type: GraphQLString },
    business_user_id: { type: GraphQLInt },
    customer_id: { type: GraphQLInt },
    rent_umbrella: { type: GraphQLInt },
    total_price: { type: GraphQLInt },
    zone_id: { type: GraphQLInt }
  }
});
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'CreateCustomReservation',
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
      let business_data = await db.models.business.findOne({
        where: {
          id: 7
        }
      })
      let timeZone = moment().tz(`${business_data.timezone}`).format();
      let uniqueString = cryptoRandomString({ length: 100, type: 'base64' });
      console.log(timeZone, business_data.timezone, "((((((((((((((((((((((")
      await db.models.reservation_beach.create({
        element_count: input.element_count,
        seat_position: input.position_seats,
        selected_days: input.selected_days,
        additional_sunbed: input.additional_sunbed,
        protocol_status: input.protocol_status,
        phone_number: input.phone_number,
        comment: input.comment,
        name: input.name,
        paid_online: input.paid_online,
        reservation_status: input.reservation_status,
        price_values: input.price_values_arr,
        discount_amount: input.discount_amount,
        business_id: input.business_id,
        business_user_id: input.business_user_id,
        rent_umbrella: input.rent_umbrella,
        extra_sunbed_price: input.extra_sunbed_price,
        rent_umbrella_price: input.rent_umbrella_price,
        created_at: timeZone,
        total_price: input.total_price,
        released_days: [],
        customer_request: [],
        zone_id: input.zone_id,
        end_days_hrs: input.end_days_hours,
        qr_code: uniqueString
      })
      return { result: "ok" };
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
  }
};
