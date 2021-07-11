const db = require('../db');
const { QueryTypes } = require('sequelize');

module.exports = async (params, limit, offset) => {
  const businessWhere = {};
  const where = {
    customer_id: params.customer_id,
  };
  if (params.type) {
    businessWhere.type = params.type;
  }

  if (params.search) {
    const query = params.search.trim();
    console.log(query, "-------------->")
    businessWhere.$or = [
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
    ];
  }
  return await db.models.customer_liked_business.findAll({
    where,
    include: [
      {
        model: db.models.business,
        where: businessWhere,
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
