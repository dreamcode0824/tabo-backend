const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
} = require('graphql');
const Errors = require('../helpers/errors');
const db = require('../db');
const { businessObjectType } = require('../schemas/business');

const type = new GraphQLInputObjectType({
  name: 'BusinessTypes',
  fields: {
    beach: {
      type: GraphQLInt
    },
    pool: {
      type: GraphQLInt
    },
    restaurant: {
      type: GraphQLInt
    },
    terrace: {
      type: GraphQLInt
    },
    club: {
      type: GraphQLInt
    }
  }
});
const createBusiness = async (type, number, client_id, country_id) => {
  let business = await db.models.business.findOne({
    where: {
      type,
      number,
      client_id
    }
  });
  if (!business) {
    business = await db.models.business.create({
      type,
      number,
      status: "inactive",
      name: "",
      location_name: type + number,
      client_id,
      currency: "RON"
    });
    if (business.type === "beach" || business.type === "pool") {
      let zone = await db.models.zone.create({
        name: "near sea",
        business_id: business.id,
        config: { "slug": "zone1" }
      });
    }
  }
  return business;
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'SaveBusinessTypes',
    fields: {
      businesses: {
        type: new GraphQLList(businessObjectType)
      }
    }
  }),
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    if (!context.client && context.client.type === 'client') {
      throw Errors.Authorization();
    }
    const { beach, pool, restaurant, terrace, club } = input;
    const client_id = context.client.id;
    const client = await db.models.client.findOne({
      where: {
        id: client_id,
      }
    });
    let i = 0;
    let business;
    for (i = 0; i < beach; i++) {
      business = await createBusiness("beach", i + 1, client_id, client.country_id);
    }
    for (i = 0; i < pool; i++) {
      business = await createBusiness("pool", i + 1, client_id, client.country_id);
    }
    for (i = 0; i < restaurant; i++) {
      business = await createBusiness("restaurant", i + 1, client_id, client.country_id);
    }
    for (i = 0; i < terrace; i++) {
      business = await createBusiness("terrace", i + 1, client_id, client.country_id);
    }
    for (i = 0; i < club; i++) {
      business = await createBusiness("club", i + 1, client_id, client.country_id);
    }
    const businesses = await db.models.business.findAll({
      where: {
        client_id,
      }
    });
    return { businesses };
  }
};
