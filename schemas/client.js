const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList
} = require('graphql');
const {attributeFields} = require('graphql-sequelize');
// const {resolver} = require('graphql-sequelize');

const {models} = require('../db');
const clientObjectType = new GraphQLObjectType({
  name: 'Client',
  description: 'Client',
  fields: {...attributeFields(models.client)}
})
module.exports = {
  clientObjectType
}