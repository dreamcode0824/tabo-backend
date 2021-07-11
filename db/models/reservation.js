const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Reservation = sequelize.define('reservation', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        number: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },

        status: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['pending', 'booked', 'accepted', 'canceled', 'expired', 'completed'],
        },

        payment_status: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['awaiting', 'paid'],
        },

        payment_method: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['online', 'offline'],
            defaultValue: 'offline'
        },

        created_for_phone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        created_for_name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        created_by: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['broker', 'customer'],
        },

        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        released_days: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },

        timezone: {
            type: DataTypes.STRING,
            allowNull: false
        },

        time_limit: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        cancel_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },

        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },

        old_amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: 0
        },

        currency: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        can_visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        protocol: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        discount: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        discount_per: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: 0
        },

        discount_type: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['percent', 'amount'],
            defaultValue: null
        },

        avg_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: 0
        },

        extra_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: 0
        },

        only_cc: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: null
        },

        invoice_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        additional_amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: 0
        },

        price_history: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        arrival_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        payment_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        updated_by_user_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        type: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ['grid', 'form'],
            defaultValue: 'grid'
        },

        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        element_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        is_vip: {
            type: DataTypes.BOOLEAN,
            default: false
        }

    }, Object.assign({}, defaultOptions));

    Reservation.associate = (models) => {

        Reservation.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

        Reservation.belongsTo(models.customer, {
            foreignKey: {
                name: 'customer_id',
                allowNull: true
            }
        });

        Reservation.belongsTo(models.business_user, {
            foreignKey: {
                name: 'business_user_id',
                allowNull: true
            }
        });

        Reservation.belongsTo(models.element, {
            foreignKey: {
                name: 'element_id',
            }
        });

        Reservation.belongsTo(models.zone, {
            foreignKey: {
                name: 'zone_id',
            }
        });
    };

    return Reservation;
};
