const Errors = require('../helpers/errors');
const db = require('../db');

module.exports = (model) => {
    return {
        model,
        list: {
            before: async (findOptions, args, context, info) => {
                if (context.user) {
                    findOptions.where = findOptions.where || {};

                    if (context.user.type === 'customer') {
                        findOptions.where.customer_id = context.user.id;
                    }
                }

                return findOptions;
            },
        },
        create: {
            before: async (source, { customer_event_status }, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }

                customer_event_status.customer_id = context.user.id;

                return customer_event_status;
            },
            after: async (newEntity, source, args, context, info) => {
                console.log('after create');

                newEntity = newEntity.toJSON();

                db.models.business_event.findOne({
                    where: {
                        id: newEntity.event_id,
                    }
                }).then(event => {
                    event.going++;
                    event.save()
                        .then(() => {
                            console.log('added going for event', event.id);
                        })
                });

                return newEntity;
            },
        },
        delete: {
            before: async (where, source, args, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }

                where.customer_id = context.user.id;

                return where;
            },
            after: async (deletedEntity, source, args, context, info) => {
                deletedEntity = deletedEntity.toJSON();

                db.models.business_event.findOne({
                    where: {
                        id: deletedEntity.event_id,
                    }
                }).then(event => {
                    event.going--;
                    event.save()
                        .then(() => {
                            console.log('added going for event', event.id);
                        })
                });

                return deletedEntity;
            },
        }
    }
};
