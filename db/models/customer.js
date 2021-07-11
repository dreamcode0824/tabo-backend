const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Customer = sequelize.define('customer', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        first_name: {
            type: DataTypes.STRING,
            allowNull: true
        },

        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },

        email: {
            type: DataTypes.STRING,
            allowNull: true, // change it to false when we require the email again
            unique: {
                args: true,
                msg: "VALIDATION.REGISTER.CUSTOMER.EMAIL.TAKEN"
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: true
        },

        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                args: true,
                msg: "VALIDATION.REGISTER.CUSTOMER.PHONE.TAKEN"
            }
        },

        blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        device: DataTypes.JSON,

        photo: {
            type: DataTypes.TEXT,
            defaultValue: null
        },

        language: {
            type: DataTypes.STRING(3),
            allowNull: true
        },

        booking_cancel_limit: DataTypes.JSON,

        stripe_customer_id: DataTypes.STRING,

        token: DataTypes.VIRTUAL,

        facebook_user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                args: true,
                msg: "VALIDATION.REGISTER.CUSTOMER.FACEBOOK.USED"
            }
        },

        facebook_auth_data: DataTypes.JSON,

        google_auth_data: DataTypes.JSON,

        google_user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                args: true,
                msg: "VALIDATION.REGISTER.CUSTOMER.GOOGLE.USED"
            }
        },

    }, Object.assign({}, defaultOptions));

    Customer.associate = (models) => {

        Customer.belongsTo(models.country, {
            foreignKey: 'country_id',
        });

        Customer.belongsTo(models.city, {
            foreignKey: 'city_id',
        });

    };

    return Customer;
};
