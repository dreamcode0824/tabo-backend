const Errors = require('../helpers/errors');
const db = require('../db');

module.exports = (model) => {
    return {
        model,
        create: {
            before: async (source, { business_event_reservation }, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }

                const priceData = await db.models.business_event_prices.findOne({
                    where: {
                        id: business_event_reservation.price_id,
                    }
                });
                business_event_reservation.amount = priceData.price * business_event_reservation.person_quantity;
                business_event_reservation.customer_id = context.user.id;
                business_event_reservation.paid = false;
                business_event_reservation.status = 'pending';
                business_event_reservation.cancelled = false;
                business_event_reservation.currency = priceData.currency;

                return business_event_reservation;
            },
        },
        update: {
            before: async (source, { business_event_reservation }, context, info) => {
                if (!context.user) {
                    throw Errors.Authorization();
                }
                if (business_event_reservation.paid) {
                    // @todo: do a stripe cancel payment here
                }

                const priceData = await db.models.business_event_prices.findOne({
                    where: {
                        id: business_event_reservation.price_id,
                    }
                });
                business_event_reservation.amount = priceData.price * business_event_reservation.person_quantity;
                business_event_reservation.customer_id = context.user.id;
                business_event_reservation.paid = false;
                business_event_reservation.status = 'pending';
                business_event_reservation.currency = priceData.currency;

                return business_event_reservation;
            },
        },
    }
};
