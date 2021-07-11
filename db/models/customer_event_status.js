const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const CustomerEventStatus = sequelize.define('customer_event_status', {

        status: {
            type: DataTypes.STRING,
            //['going','interested','reserved']
        },

    }, Object.assign({}, defaultOptions));

    CustomerEventStatus.associate = (models) => {

        CustomerEventStatus.belongsTo(models.customer, {
            foreignKey: 'customer_id',
        });

        CustomerEventStatus.belongsTo(models.business_event, {
            foreignKey: 'event_id',
        });

    };

    return CustomerEventStatus;
};
