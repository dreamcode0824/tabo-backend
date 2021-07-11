const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const PaymentBusinessClient = sequelize.define('payment_business_client', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        payment_customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        payment_system: {
            type: DataTypes.STRING,
            // values: ['stripe', 'twispay'],
            allowNull: false,
        },

        tos_accepted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        payment_person_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        balance: {
            type: DataTypes.JSON,
            allowNull: true,
        }

    }, Object.assign({}, defaultOptions));

    PaymentBusinessClient.associate = (models) => {

        PaymentBusinessClient.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return PaymentBusinessClient;
};
