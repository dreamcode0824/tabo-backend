const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

const db = require('../db');

const calculatePrice = async (data) => {
    const {
        is_vip,
        zone_id,
        element_id,
        business_id,
        additional_umbrella_count,
        quantity,
        start_date,
        end_date,
        business_settings
    } = data;

    const where = {
        element_id: element_id * 1,
        business_id: business_id * 1,
        $or: [],
    };
    const range = moment().range(start_date, end_date);
    const dates = [];
    Array.from(range.by('days')).forEach(d => {
        const date = d.format('YYYY-MM-DD');
        dates.push(date);
        where.$or.push({
            start_date: {
                $lte: date,
            },
            end_date: {
                $gte: date,
            },
        });
    });

    if (zone_id) {
        where.zone_id = zone_id * 1;
    } else
    if (is_vip) {
        where.zone_id = null;
    }

    const prices = await db.models.price.findAll({
        where,
        raw: true
    });

    const additionalUmbrellaPrice = additional_umbrella_count && business_settings.additional_umbrella_price ? business_settings.additional_umbrella_price : 0;

    let priceSum = 0;
    const datesPrices = {};
    for (let i=0; i<prices.length; i++) {
        const price = prices[i];
        const range = moment.range(moment(price.start_date).format("YYYY-MM-DD"), moment(price.end_date).format("YYYY-MM-DD"));
        for (let j=0; j<dates.length; j++) {
            const date = dates[j];
            if (moment(date).within(range) && !datesPrices[date]) {
                datesPrices[date] = ((price.price_vip || price.price_zone) * quantity) + (additionalUmbrellaPrice * (additional_umbrella_count || 1));
                priceSum += datesPrices[date];
            }
        }
    }

    return {
        priceSum,
        avgPrice: priceSum / dates.length,
    };
};

const approvePayment = async (business_number, reservation_number) => {
    const business = await db.models.business.findOne({
        where: {
            number: business_number
        }
    });
    const reservation = await db.models.reservation.findOne({
        where: {
            business_id: business.id,
            number: reservation_number,
        }
    });
    if (reservation &&
        reservation.payment_status === 'awaiting' &&
        reservation.payment_method === 'online' &&
        reservation.old_amount * 1 === 0 &&
        reservation.amount * 1 > 0
    ) {
        reservation.old_amount = reservation.amount;
        reservation.amount = 0;
        reservation.status = 'booked';
        reservation.payment_status = 'paid';

        await reservation.save();
    }

    return reservation;
};

module.exports = {
    approvePayment,
    calculatePrice,
};
