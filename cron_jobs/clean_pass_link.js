const cron = require('node-cron');
const db = require('../db');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const cleanPassLink = () => {
  cron.schedule('* * * * *', async () => {
    let serveTime = new Date().getTime();
    let allData = await db.models.client.findAll();
    if (allData.length > 0) {
      for (let i = 0; i < allData.length; i++) {
        if (allData[i].time_link) {
          let linkTimeStamp = new Date(allData[i].time_link).getTime();
          let addMins = (30 * 60 * 1000) + linkTimeStamp;
          if (serveTime > addMins) {
            await db.models.client.update({
              time_link: "",
              reset_pass_link: ""
            }, {
              where: {
                id: allData[i].id,
              }
            });
          }
        }
      }
    }
  });
  return true;
}
exports.cleanPassLink = cleanPassLink;
