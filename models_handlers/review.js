const db = require('../db');

module.exports = (model) => {
    return {
        model,
        create: {
            after: async (newEntity, source, args, context, info) => {
                debugger;

                // console.log(newEntity.business_id);

                // do without await to not block the response
                db.models.review.findOne({
                    where: {
                        business_id: newEntity.business_id
                    },
                    attributes: {
                        include: [
                            [db.Sequelize.fn('AVG', db.Sequelize.col('review.rate')), 'avg_rate']
                        ]
                    },
                    group: 'business_id'
                }).then(rateCalculated => {
                    if (rateCalculated) {
                        // console.log('rateCalculated.toJSON().avg_rate', rateCalculated.toJSON().avg_rate);
                        db.models.business.update({
                            avg_rate: rateCalculated.toJSON().avg_rate
                        }, {
                            where: {
                                id: newEntity.business_id
                            }
                        });
                    }
                });

                return newEntity
            },
        },
    }
};
