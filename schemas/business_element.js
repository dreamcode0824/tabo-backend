const {
  GraphQLObjectType,
} = require('graphql');
const { attributeFields } = require('graphql-sequelize');
// const {resolver} = require('graphql-sequelize');

const { models } = require('../db');
const businessElementObjectType = new GraphQLObjectType({
  name: 'BusinessElement',
  description: 'All Elements for location',
  fields: { ...attributeFields(models.business_element) }
})
module.exports = {
  businessElementObjectType
}