const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessEventPrice = sequelize.define('business_event_prices', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        zone: {
            type: DataTypes.STRING,
            allowNull: false,
            // ['vip', 'regular'..]
        },

        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        currency: DataTypes.STRING,

    }, Object.assign({}, defaultOptions));

    BusinessEventPrice.associate = (models) => {

        BusinessEventPrice.belongsTo(models.business_event, {
            foreignKey: 'business_event_id'
        });

    };

    return BusinessEventPrice;
};
