const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessEventReservation = sequelize.define('business_event_reservation', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        person_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        cancelled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        amount: {
            type: DataTypes.DECIMAL,
        },

        currency: {
            type: DataTypes.STRING,
        },

        paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        status: {
            type: DataTypes.STRING,
            // pending, booked
        },

    }, Object.assign({}, defaultOptions));

    BusinessEventReservation.associate = (models) => {

        BusinessEventReservation.belongsTo(models.business_event, {
            foreignKey: 'business_event_id',
            allowNull: false
        });

        BusinessEventReservation.belongsTo(models.customer, {
            foreignKey: 'customer_id',
            allowNull: false
        });

        BusinessEventReservation.belongsTo(models.business_event_prices, {
            foreignKey: 'price_id',
            allowNull: false
        });
    };

    return BusinessEventReservation;
};
