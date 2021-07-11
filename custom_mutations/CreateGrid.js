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
const { businessElementObjectType } = require('../schemas/business_element');

const item = new GraphQLInputObjectType({
  name: 'item',
  fields: {
    position: {
      type: new GraphQLInputObjectType({
        name: 'coords',
        fields: {
          x: { type: GraphQLFloat },
          y: { type: GraphQLFloat },
          number: { type: GraphQLString },
          zoomRate: { type: GraphQLFloat },
          zoomAreaValue: { type: GraphQLFloat },
          displayValue: { type: GraphQLFloat },
        }
      })
    },
    id: { type: GraphQLString },
    rotate_angle: { type: GraphQLFloat },
    is_vip: { type: GraphQLBoolean },
    element_id: { type: GraphQLInt },
    business_id: { type: GraphQLInt },
    table_number: { type: GraphQLString },
    unique_id: { type: GraphQLInt },
    zone_id: { type: GraphQLInt },
  }
});
const type = new GraphQLInputObjectType({
  name: 'CreateGridInput',
  fields: {
    businessId: {
      type: GraphQLInt
    },
    list: {
      type: new GraphQLList(item)
    },
    moved: {
      type: GraphQLString
    },
    moved1: {
      type: GraphQLString
    },
    distance: {
      type: GraphQLInt
    }
  }
});
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'CreateGrid',
    fields: {
      businesse_elements: {
        type: new GraphQLList(businessElementObjectType)
        // type:new GraphQLList(GraphQLInt)
      },
      moved: {
        type: GraphQLString
      },
      moved1: {
        type: GraphQLString
      },
    }
  }),
  description:
    'Enable or disable a group for the current user.',
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    let businessId = input.businessId;
    const businessElementsData = await input.list.map(item => {
      //@todo uncomment this after implementing login/auth and checks with middlewares for permissions
      // item.business_id = context.user.business_id;
      return item;
    });
    if (businessElementsData.length === 0) {
      // console.log('dadarg a apeee');
      // return;
    }
    let oldBusinessElements = await db.models.business_element.findAll({ where: { business_id: businessId } });
    // return {result:businessId}
    let { moved, moved1, distance } = input;
    const transaction = await db.sequelize.transaction();
    try {
      // await businessElementsData.map(async (businessElement) => {
      for (let i = 0; i < businessElementsData.length; i++) {
        let businessElement = businessElementsData[i]
        // }
        let item;
        if (businessElement.id) item = await db.models.business_element.findOne({ where: { id: businessElement.id } });
        if (item) {
          await item.update(
            {
              position: businessElement.position,
              rotate_angle: businessElement.rotate_angle,
              table_number: businessElement.table_number,
              unique_id: businessElement.unique_id
            }
            , { transaction }
          );
          oldBusinessElements = oldBusinessElements.filter((oldBusinessElement) => {
            return oldBusinessElement.id !== item.id
          })
        } else {
          item = await db.models.business_element.create({
            position: businessElement.position,
            rotate_angle: businessElement.rotate_angle,
            is_vip: businessElement.is_vip,
            element_id: businessElement.element_id,
            zone_id: businessElement.zone_id,
            business_id: businessElement.business_id,
            table_number: businessElement.table_number,
            unique_id: businessElement.unique_id
          }
            , { transaction });
          if (businessElement.id == moved) {
            moved = item.id;
          }
          if (businessElement.id == moved1) {
            moved1 = item.id;
          }
        }
      }
      const deleteIds = await oldBusinessElements.map(item => {
        return item.id;
      });
      await db.models.business_element.destroy({ where: { id: deleteIds } }, { transaction });
      let businessElements = await db.models.business_element.findAll({ where: { business_id: businessId } });
      const businessElementIdMap = {};
      const elementsIds = businessElements.map(item => {
        businessElementIdMap[item.element_id] = item.id;
        return item.element_id
      });
      const elements = await db.models.element.findAll({
        where: {
          id: elementsIds
        }
      });

      const elementsMap = {};
      elements.forEach(element => {
        elementsMap[element.id] = element;
      });

      const seats = generateSeatsForElements(elementsIds, elementsMap, businessElementIdMap, businessId);
      //@todo fix this part, ask Armen to review
      // await db.models.seat.destroy({
      //     where: {
      //         business_element_id: businessElementIdMap
      //     }
      // });
      await db.models.seat.bulkCreate(seats, { transaction });

      const availableElements = Object.keys(businessElementIdMap)
        .map(b_el_id => {
          return {
            business_id: businessId,
            element_id: b_el_id,
          }
        });
      await db.models.business_available_elements.destroy({
        where: {
          business_id: businessId
        }
      });
      await db.models.business_available_elements.bulkCreate(availableElements, { transaction });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();

      // console.log(e);

      throw e;
    }
    await delay(100);
    const business = await db.models.business.findOne({ where: { id: businessId } });
    const location = business.location;
    const grid = { moved, moved1 }
    await business.update({
      location: { ...location, grid }
    })
    businessElements = await db.models.business_element.findAll({ where: { business_id: businessId } });
    return { businesse_elements: businessElements, moved, moved1 };
  }
};

function generateSeatsForElements(elementsIds, elementsMap, businessElementIdMap, businessId) {
  const seats = [];
  elementsIds.forEach(elementId => {
    const element = elementsMap[elementId];
    // console.log('element.type', element.type);

    if (element.type === 'umbrella') {
      let index = 0;
      if (element.structure.sunbed) {
        if (element.structure.sunbed.center) {
          index++;
          seats.push({
            index,
            business_element_id: businessElementIdMap[element.id],
            business_id: businessId,
          })
        } else {
          for (let i = 0; i < element.structure.sunbed.left * 1 + element.structure.sunbed.right * 1; i++) {
            index++;
            seats.push({
              index,
              business_element_id: businessElementIdMap[element.id],
              business_id: businessId,
            })
          }
        }
      } else
        if (element.structure.bed) {
          let index = 0;
          if (element.structure.bed.center) {
            index++;
            seats.push({
              index,
              business_element_id: businessElementIdMap[element.id],
              business_id: businessId,
            });
          } else {
            for (let i = 0; i < element.structure.bed.left * 1 + element.structure.bed.right * 1; i++) {
              index++;
              seats.push({
                index,
                business_element_id: businessElementIdMap[element.id],
                business_id: businessId,
              })
            }
          }
        }
    } else
      if (element.type === 'table') {
        for (let i = 0; i < element.structure.seats * 1; i++) {
          seats.push({
            index: i + 1,
            business_element_id: businessElementIdMap[element.id],
            business_id: businessId,
          })
        }
      } else {
        seats.push({
          index: 1,
          business_element_id: businessElementIdMap[element.id],
          business_id: businessId,
        })
      }
  });
  return seats;
}
