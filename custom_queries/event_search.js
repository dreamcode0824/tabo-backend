const db = require('../db');
const { QueryTypes } = require('sequelize');

module.exports = async (params, limit, offset) => {
    const search = params.search.trim().toLowerCase();
    const attributes = [
        'id',
        'title',
        'description',
        'going',
        'interested',
        'reserved',
        'thumbnail',
        'main',
        'date',
        'business_id',
        'location_position',
        'location_name',
    ].map(a => `business_event.${a}`);

    const query = `SELECT DISTINCT ${attributes.join(', ')} FROM business_event 
        LEFT JOIN customer_event_status ON (business_event.id = customer_event_status.event_id)
        INNER JOIN business ON (business_event.business_id = business.id)
        WHERE 
            business_event.title LIKE :title_search OR
            business.name LIKE :name_search OR
            business.type LIKE :type_search OR
            (customer_event_status.status = :search AND customer_event_status.customer_id = :customer_id)
        
    `;
    //LIMIT ${offset}, ${limit};

    // console.log(query);
    try {
        const result = await db.sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                search,
                title_search: search + '%',
                name_search: '%' + search + '%',
                type_search: search + '%',
                customer_id: params.customer_id,
            }
        });
        // console.log('sdfsfasdf asdfsdf');
        // console.log(result);

        return result;
    } catch (e) {
        console.log(e);

        return [];
    }
};
