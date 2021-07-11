const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const CustomerLikedEvent = sequelize.define('customer_liked_event', {

    }, Object.assign({}, defaultOptions));

    CustomerLikedEvent.associate = (models) => {

        CustomerLikedEvent.belongsTo(models.customer, {
            foreignKey: 'customer_id',
        });

        CustomerLikedEvent.belongsTo(models.business_event, {
            foreignKey: 'event_id',
        });

    };

    return CustomerLikedEvent;
};
