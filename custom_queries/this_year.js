const db = require('../db');
const { QueryTypes } = require('sequelize');
const geoTz = require('geo-tz')

module.exports = async (params, limit, offset) => {
  if (params.business_id) {
    const business = await db.models.business.findOne({ where: { id: params.business_id } });
    const city = await db.models.city.findOne({ where: { id: business.city_id } });
    if (city) {
      process.env.TZ = geoTz(city.latitude, city.longitude);
      return (new Date().getFullYear());
    }
    return business;
  }
  return 2020;
};