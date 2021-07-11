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
const { zoneObjectType } = require('../schemas/zone');

const zoneItem = new GraphQLInputObjectType({
  name: 'zoneItem',
  fields: {
    config: {
      type: new GraphQLInputObjectType({
        name: 'config',
        fields: {
          slug: { type: GraphQLString },
        }
      })
    },
    id: { type: GraphQLString },
    name: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'SaveZonesInput',
  fields: {
    businessId: {
      type: GraphQLInt
    },
    list: {
      type: new GraphQLList(zoneItem)
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
    name: 'SaveZones',
    fields: {
      zones: {
        type: new GraphQLList(zoneObjectType)
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
    let businessId = input.businessId;
    const businessZones = input.list.map(item => {
      //@todo uncomment this after implementing login/auth and checks with middlewares for permissions
      // item.business_id = context.user.business_id;
      return item;
    });
    if (businessZones.length === 0) {
      // console.log('dadarg a apeee');
      // return;
    }
    let oldBusinessZones = await db.models.zone.findAll({ where: { business_id: businessId } });
    // return {result:businessId}
    // const transaction = await db.sequelize.transaction();
    try {
      const result = await db.sequelize.transaction(async (t) => {
        await businessZones.map(async (businessZone) => {
          let item;
          if (businessZone.id) item = await db.models.zone.findOne({ where: { id: parseInt(businessZone.id) } });
          if (item) {
            await item.update(
              {
                config: businessZone.config,
                name: businessZone.name
              }
              , { t }
            );
            oldBusinessZones = oldBusinessZones.filter((oldBusinessZone) => {
              return parseInt(oldBusinessZone.id) !== item.id
            })
          } else {
            await db.models.zone.create({
              config: businessZone.config,
              name: businessZone.name,
              business_id: businessId
            }
              , { t });
          }
        });
      });
    } catch (e) {
      // await transaction.rollback();
      console.log(e);
      throw e;
    }
    await delay(100);
    const deleteIds = oldBusinessZones.map(item => {
      return item.id;
    });
    if (deleteIds.length > 0) {
      await db.models.zone.destroy({ where: { id: deleteIds } });
    }
    // console.log(deleteIds, "deleteIds")
    const zones = await db.models.zone.findAll({ where: { business_id: businessId } });
    return { zones: zones };
  }
};
