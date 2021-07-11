const fs = require('fs');
const path = require('path');
const { models } = require('../db');

const graphqlSchemaDeclaration = {};

Object.keys(models).forEach(name => {
  const modulePath = path.join(__dirname, name + '.js');
  const customHandler = fs.existsSync(modulePath) ? require(modulePath) : null;
  const handlers = customHandler ? { ...defaultHandlers(), ...customHandler(models[name]) } : defaultHandlers();

  if (name === 'custom_query') {
    graphqlSchemaDeclaration[name] = {
      actions: ['list'],
      model: models[name],
      ...handlers
    };
  } else {
    graphqlSchemaDeclaration[name] = {
      actions: ['list', 'create', 'delete', 'update', 'count'],
      model: models[name],
      ...handlers
    };
  }

});

function defaultHandlers() {
  return {
    create: {
      before: async (source, args, context, info) => {
        return args[Object.keys(args)[0]];
      },
      after: async (newEntity, source, args, context, info) => {
        return newEntity;
      },
    },
    update: {
      before: async (source, args, context, info) => {
        return args[Object.keys(args)[0]];
      },
      after: async (
        updatedEntity,
        entitySnapshot,
        source,
        args,
        context,
        info
      ) => {
        // You can log what happened here
        return updatedEntity;
      },
    },
    delete: {
      before: async (where, source, args, context, info) => {
        // You can restrict the creation if needed
        return where;
      },
      after: async (deletedEntity, source, args, context, info) => {
        // You can log what happened here
        return deletedEntity;
      },
    },
  };
}

module.exports = graphqlSchemaDeclaration;
