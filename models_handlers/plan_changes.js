const Errors = require('../helpers/errors');
const db = require('../db');
const moment = require('moment');
const { Op } = require("sequelize");
const getMonthDateRange = (year, month) => {
  var moment = require('moment');

  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  // array is 'year', 'month', 'day', etc
  var startDate = moment([year, month - 1]);

  // Clone the value before .endOf()
  var endDate = moment(startDate).endOf('month');

  // make sure to call toDate() for plain JavaScript date type
  return { start: startDate, end: endDate };
}

module.exports = (model) => {
  return {
    model,
    actions: ['list', 'create', 'count'],
    create: {
      before: async (source, { plan_changes }, context, info) => {
        let today = moment();
        const monthDates = getMonthDateRange(today.format('YYYY'), today.format('M'));
        const existings = await db.models.plan_changes.findAll({
          where: {
            created_at: {
              [Op.gte]: monthDates.start.format("YYYY-MM-dd H:i:s")
            },
            business_id: plan_changes.business_id
          }
        });
        if (existings.length > 1) {
          throw Errors.PlanSaveInvalid();
        }
        return plan_changes;
      },
    }
  }
};
