const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList
} = require('graphql');
const { attributeFields } = require('graphql-sequelize');
// const {resolver} = require('graphql-sequelize');

const { models } = require('../db');
const zoneObjectType = new GraphQLObjectType({
  name: 'Zone',
  description: 'Zone',
  fields: { ...attributeFields(models.zone) }
})
module.exports = {
  zoneObjectType
}