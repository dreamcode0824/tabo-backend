const cron = require('node-cron');
const db = require('../db');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const changeReservationStatus = () => {
  cron.schedule('*/10 * * * * *', async () => {
    let reservationData = await db.models.reservation_beach.findAll();
    let todayDate = new Date();
    let getYear = todayDate.getFullYear();
    let getMonth = todayDate.getMonth();
    let getDate = todayDate.getDate();
    let getHour = todayDate.getHours();
    let getMinute = todayDate.getMinutes();
    let currentDate = `${getYear}-${getMonth + 1 > 9 ? getMonth + 1 : "0" + (getMonth + 1)}-${getDate > 9 ? getDate : "0" + getDate}`
    let currentTime = `${getHour > 9 ? getHour : "0" + getHour}:${getMinute > 9 ? getMinute : "0" + getMinute}`
    console.log(reservationData.length, todayDate, currentDate, getHour, getMinute, "running check reservation status")
    if (reservationData.length > 0) {
      for (let i = 0; i < reservationData.length; i++) {
        if (reservationData[i].selected_days) {
          if (reservationData[i].selected_days.length > 1) {

          } else {
            if (reservationData[i].selected_days[0].day == currentDate) {
              if (reservationData[i].end_days_hrs) {
                console.log(i, "**************************")
                let t1 = reservationData[i].end_days_hrs[0].hour;
                let t2 = currentTime;
                if (t1 < t2) {
                  await db.models.reservation_beach.update({
                    reservation_status: "expired"
                  }, {
                    where: {
                      id: reservationData[i].id
                    }
                  });
                }
              }
            }
          }
        }
      }
    }
  })
  return true;
}
exports.changeReservationStatus = changeReservationStatus;