const {
    GraphQLObjectType,
  } = require('graphql');
  const {attributeFields} = require('graphql-sequelize');
  // const {resolver} = require('graphql-sequelize');
  
  const {models} = require('../db');
  const businessObjectType = new GraphQLObjectType({
    name: 'Business',
    description: 'Client',
    fields: {...attributeFields(models.business)}
  })
  module.exports = {
    businessObjectType
  }