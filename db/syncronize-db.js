require('dotenv').config();

const { QueryTypes } = require('sequelize');
const db = require('./index');

// db.models.business.sync({alter: true});
// db.models.business_event_prices.sync({alter: true});
// db.models.business_event_gallery.sync({alter: true});
// db.models.customer_liked_event.sync({alter: true});
// db.models.beach_menu_item.sync({alter: true});
// db.booking.sync({alter: true})
//     .catch(err => {
//         console.error(err.message);
//     });
return;

db.sequelize.sync({ alter: true }).then(function () {
    console.log(`DB sync was done successfully.`);

    console.log('Start indexing in 5 seconds...');

    setTimeout(() => {
        Object.keys(db).forEach(modelName => {
            (db[modelName].options.customIndexes || []).forEach(index => {
                if (index.unique) {
                    const indexName = index.fields.join('_');
                    const fields = index.fields.join(', ');
                    const query = `CREATE UNIQUE INDEX unique_${indexName} ON ${db[modelName].tableName} (${fields})`;
                    // console.log(query);
                    db.sequelize.query(query, { type: QueryTypes.RAW })
                        .catch(err => {
                            throw err.toString() + '\n' + err.sql;
                        })
                } else {
                    index.fields.forEach(fieldName => {
                        const query = `CREATE INDEX ${db[modelName].tableName}_${fieldName} ON ${db[modelName].tableName} (${fieldName})`;
                        // console.log(query);
                        db.sequelize.query(query, { type: QueryTypes.RAW })
                            .catch(err => {
                                throw err.toString() + '\n' + err.sql;
                            })
                    })
                }
            })
        });
    }, 5000)
});
