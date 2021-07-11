require('dotenv').config();

const fs = require('fs');
const { printSchema } = require('graphql');
const {
    generateModelTypes,
    generateApolloServer,
} = require('graphql-sequelize-generator');
const { models } = require('./db');
const graphqlSchemaDeclaration = require('./schemas');
const customMutations = require('./custom_mutations');
const types = generateModelTypes(models);

const server = generateApolloServer({
    graphqlSchemaDeclaration,
    types,
    models,
    customMutations,
});

fs.writeFileSync(__dirname+'/schema.graphql', printSchema(server.config.schema));
