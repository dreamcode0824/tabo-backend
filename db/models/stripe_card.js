const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const StripeCard = sequelize.define('stripe_card', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        payment_method_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        brand: {
            type: DataTypes.STRING,
        },

        country_code: {
            type: DataTypes.CHAR(2),
        },

        cvc_check: {
            type: DataTypes.STRING,
        },

        exp_month: {
            type: DataTypes.INTEGER,
        },

        exp_year: {
            type: DataTypes.INTEGER,
        },

        fingerprint: {
            type: DataTypes.STRING,
        },

        funding: {
            type: DataTypes.STRING,
        },

        last4: {
            type: DataTypes.STRING,
        },

    }, Object.assign({}, defaultOptions));

    StripeCard.associate = (models) => {

        StripeCard.belongsTo(models.customer, {
            foreignKey: 'customer_id'
        });

    };

    return StripeCard;
};
