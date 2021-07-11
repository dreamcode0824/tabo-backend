const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessSettings = sequelize.define('business_settings', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        index: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        promoted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        promoted_index: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        working_dates: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },

        working_hours: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },

        timezone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        currency: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        radius: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        extra_sunbeds: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        booking_time_limit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 15
        },
        estimated_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 30
        },
        guaranteed_reservation: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        cancel_daily_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },

        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },

        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },

        menu: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        card: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        only_cc: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        broker: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        photo_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        without_pay_reserve: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        require_call: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        agreement: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },

        print_bill: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        diff_price: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        new_price: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        online_reservation_option: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['from_all', 'your_own', 'your_own_and_others'],
            defaultValue: 'from_all'
        },

        reservation_type: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['grid', 'form'],
            defaultValue: 'grid'
        },

        is_full: {
            type: DataTypes.JSON,
            defaultValue: null,
        },

        additional_umbrella_price: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        umbrella_requrired: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        beach_location_country: {
            type: DataTypes.STRING,
        },
        beach_location_city: {
            type: DataTypes.STRING,
        },
        money_selected: {
            type: DataTypes.STRING,
        },
        temporary_closed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, Object.assign({}, defaultOptions));

    BusinessSettings.associate = models => {

        BusinessSettings.belongsTo(models.business, {
            foreignKey: 'business_id',
        });

    };

    return BusinessSettings;
};
