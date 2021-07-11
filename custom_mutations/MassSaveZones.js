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

const businessElementItem = new GraphQLInputObjectType({
  name: 'businessElementItem',
  fields: {
    id: { type: GraphQLInt },
    zone_id: { type: GraphQLInt },
  }
});
const type = new GraphQLInputObjectType({
  name: 'MassSaveBusinessZonesInput',
  fields: {
    list: {
      type: new GraphQLList(businessElementItem)
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
    name: 'MassSaveZones',
    fields: {
      result: {
        type: GraphQLString
        // type:new GraphQLList(GraphQLInt)
      }
    }
  }),
  description:
    'Enable or disable a group for the current user.',
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    let businessId;
    const businessElements = input.list.map(item => {
      //@todo uncomment this after implementing login/auth and checks with middlewares for permissions
      // item.business_id = context.user.business_id;
      return item;
    });
    if (businessElements.length === 0) {
      // console.log('dadarg a apeee');
      // return;
    }
    // const transaction = await db.sequelize.transaction();
    try {
      const result = await db.sequelize.transaction(async (t) => {
        await businessElements.map(async (businessElement) => {
          const item = await db.models.business_element.findOne({ where: { id: businessElement.id } });
          await item.update(
            {
              zone_id: businessElement.zone_id,
            }
            , { t }
          );
        });
      });
    } catch (e) {
      // await transaction.rollback();

      console.log(e);

      throw e;
    }
    return { result: 'ok' };
  }
};
