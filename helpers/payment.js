const stripe = require('stripe')(process.env.stripeSecretKey);
const moment = require('moment');

const db = require('../db');
const customerHelper = require('./customer');
const reservationHelper = require('./reservation');

const SMART_BEACH_COMMISSION = 10;

const reservationPaymentStripe = async (reservation_id, customer) => {
    try {
        const reservation = await db.models.reservation.findOne({
            where: {
                id: reservation_id,
            }
        });
        if (reservation.payment_status !== 'awaiting') {
            throw {
                message: 'RESERVATION_ALREADY_PAID'
            }
        }

        // if (await bookingCommon.isBeachGridLocked(reservation.beach_id)) {
        //     throw {
        //         gridIsLocked: true,
        //         message: 'GRID_IS_TEMPORARY_LOCKED'
        //     };
        // }

        const business = await db.models.business.findOne({
            where: {
                id: reservation.business_id
            },
            attributes: ['id', 'number', 'name', 'client_id',]
        });

        const description = `${business.name}, reservation #${reservation.number} from ${moment(reservation.start_date).format('DD/MM/YY')} to ${moment(reservation.end_date).format('DD/MM/YY')}`;
        const metadata = {
            integration_check: 'accept_a_payment',
            reservation_id: reservation.id,
            reservation_number: reservation.number,
            beach: business.name,
            customer_id: customer.id,
            business_number: business.number,
            business_id: business.id,
        };

        return await createPayment({
            business_id: reservation.business_id,
            amount: reservation.amount,
            customer,
            description,
            metadata,
            currency: reservation.currency
        });
    } catch (err) {
        console.log(err);
        throw {
            status: 'error',
            message: err.message,
            error: err.error,
            gridIsLocked: err.gridIsLocked,
        };
    }
};

const eventPaymentStripe = async (event_id, customer) => {
    try {
        const event = await db.models.business_event.findOne({
            where: {
                id: event_id,
            }
        });
        const eventData = await db.models.business_event_reservation.findOne({
            where: {
                business_event_id: event_id,
                customer_id: customer.id,
            },
            include: [
                {
                    model: db.models.business_event_prices,
                    as: 'price',
                }
            ]
        });
        if (eventData.paid === true) {
            throw {
                message: 'RESERVATION_ALREADY_PAID'
            }
        }

        const business = await db.models.business.findOne({
            where: {
                id: event.business_id
            },
            attributes: ['id', 'number', 'name', 'client_id',]
        });

        const description = `${business.name}, event "${event.title}" with ID: ${event.id}`;
        const metadata = {
            integration_check: 'accept_a_payment',
            event_id,
            event_title: event.title,
            beach: business.name,
            customer_id: customer.id,
            business_number: business.number,
            business_id: business.id,
        };

        return await createPayment({
            business_id: business.id,
            amount: eventData.amount,
            customer,
            description,
            metadata,
            currency: eventData.price.currency
        });
    } catch (err) {
        console.log(err);
        throw {
            status: 'error',
            message: err.message,
            error: err.error,
            gridIsLocked: err.gridIsLocked,
        };
    }
};

async function createPayment(data) {
    const {
        business_id,
        amount,
        customer,
        description,
        metadata,
        currency,
    } = data;

    const discount = await db.models.all_coupons.findOne({
        where: {
            business_id,
            accept_online: true,
            status: {
                $ne: 'used',
            },
        }
    });
    const feeWithoutDiscount = amount * SMART_BEACH_COMMISSION / 100;
    const application_fee_amount = discount && discount.value > 0 ?
        feeWithoutDiscount - (feeWithoutDiscount * discount.value / 100) :
        feeWithoutDiscount;
    const businessStripe = await db.models.payment_business_client.findOne({
        where: {
            business_id,
        }
    });
    if (!businessStripe) {
        throw {
            message: 'SERVER.PLEASE_CONTACT_US'
        }
    }

    if (!customer.stripe_customer_id) {
        const stripeCustomer = await stripe.customers.create({
            email: customer.email,
            phone: customer.phone,
            // metadata: {
            //     tabo_id: `tabo_${customer.id}`,
            // }
        });

        // console.log(stripeCustomer);
        customer.stripe_customer_id = stripeCustomer.id;
        customer.save()
            .then(res => {
                console.log('Stripe customer id added to tabo customer successfully');
            });
    }

    const response = {
        publishable_key: process.env.stripePublishableKey
    };

    const paymentIntent = await stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: fixAndMultiplyAmount(amount, 100), // there are currencies called zero-decimal that don't need to multiply by 100 => https://stripe.com/docs/currencies#presentment-currencies
        currency,
        application_fee_amount: fixAndMultiplyAmount(application_fee_amount, 100),
        receipt_email: customer.email,
        transfer_data: {
            destination: businessStripe.payment_customer_id,
        },
        description,
        customer: customer.stripe_customer_id,
        metadata,
        capture_method: 'manual'
    });

    response.client_secret = paymentIntent.client_secret;

    return response;
}

async function webhookReservation(data) {
    const {
        success,
        notificationAdditionalData,
        business_number,
        reservation_number,
        customer_id,
    } = data;

    const reservation = await reservationHelper.approvePayment(business_number, reservation_number);

    //@todo send notifications here

    return reservation;
}

async function webhookEvent(data) {
    const {
        success,
        notificationAdditionalData,
        business_number,
        event_id,
        customer_id,
    } = data;

    const eventData = await db.models.business_event_reservation.findOne({
        where: {
            business_event_id: event_id,
        }
    });
    if (!eventData.paid && !eventData.cancelled && eventData.amount > 0) {
        eventData.paid = true;
        eventData.status = 'booked';

        await eventData.save();
    }
    //@todo send notifications here

    return event;
}

/**
 * Function for fixing cases when floating numbers multiplies by 10, 100 ..
 * @param amount
 * @param number
 * @returns {number}
 */
function fixAndMultiplyAmount(amount, number) {
    const amountString = amount + '';
    const amountArray = amountString.split('.');
    if (amountArray.length > 1 && amountArray[1]) {
        const fixBy = Math.pow(10, amountArray[1].length);
        return amount * fixBy * number / fixBy
    }

    return amount * number;
}

module.exports = {
    reservationPaymentStripe,
    eventPaymentStripe,
    webhookReservation,
    webhookEvent,
};
