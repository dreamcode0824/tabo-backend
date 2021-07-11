const db = require('../db');
const { QueryTypes } = require('sequelize');

module.exports = async (params, limit, offset) => {
    const query = params.search.trim();

    return await db.models.reservation.findAll({
        where: {
            customer_id: params.customer_id,
            status: params.status,
            payment_status: params.payment_status,
        },
        include: [
            {
                model: db.models.business,
                where: {
                    $or: [
                        {
                            name: {
                                $like: `%${query}%`
                            }
                        },
                        {
                            type: {
                                $like: `${query}%`
                            }
                        },
                    ]
                },
                include: [
                    {
                        model: db.models.country,
                        attributes: ['name'],
                    },
                    {
                        model: db.models.city,
                        attributes: ['name'],

                        include: {
                            model: db.models.state,
                            attributes: ['name']
                        }
                    }
                ],
                attributes: [
                    'id',
                    'name',
                    'image',
                    'avg_rate',
                    'type',
                    'location',
                    'city_id',
                ],
            }
        ],
        limit,
        offset,
    });
};
