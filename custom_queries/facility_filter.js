const db = require('../db');
const { QueryTypes } = require('sequelize');

module.exports = async (params, limit, offset) => {
    const replacements = {
        facility_id: params.facilityIds.join(', '),
    };

    let query = `
        SELECT DISTINCT business.id, business.name, business.avg_rate, business.image, business.status, business.type,
            business.country_id, business.city_id, business.location,
            country.id as 'country.id', country.name as \`country.name\`, city.id as \`city.id\`, city.name as \`city.name\`
        FROM business 
            INNER JOIN business_facilities 
                ON (business.id = business_facilities.business_id AND business_facilities.facility_id IN (:facility_id))
            INNER JOIN country ON country.id = business.country_id
            INNER JOIN city ON city.id = business.city_id
        WHERE business.status='active'
    `;
    if (params.city_id) {
        query += ` AND business.city_id= :city_id`;
        replacements.city_id = params.city_id;
    }
    if (params.country_id) {
        query += ` AND business.country_id= :country_id`;
        replacements.country_id = params.country_id;
    }
    if (params.sort && params.sort !== 'normal') {
        query += ` ORDER BY business.${params.sort} DESC`;
    }
    if (limit && offset) {
        query += ` LIMIT ${offset}, ${limit}`
    }

    // console.log(JSON.stringify(query));
    return await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
        nest: true,
        replacements,
    }).map(item => {
        item.location = JSON.parse(item.location);

        return item;
    });
};
