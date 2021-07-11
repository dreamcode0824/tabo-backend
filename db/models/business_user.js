const defaultOptions = require('../defaultOptions');
const ROLES = [
    'client',
    'kitchen',
    'bar',
    'manager',
    'administrator',
    'owner',
    'cashier',
];

module.exports = (sequelize, DataTypes) => {

    const BusinessUser = sequelize.define('business_user', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        unlock_code: {
            type: DataTypes.INTEGER,
            unique: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: "VALIDATION.REGISTER.BROKER.NAME.TAKEN"
            }
        },

        color: {
            type: DataTypes.STRING,
            allowNull: false
        },

        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

        language: {
            type: DataTypes.STRING(3),
            allowNull: true
        },

        role: {
            type: DataTypes.STRING,
            // type: DataTypes.ENUM,
            // values: ROLES,
            defaultValue: null
        },

    }, Object.assign({}, defaultOptions));

    BusinessUser.associate = (models) => {

        BusinessUser.belongsTo(models.business, {
            foreignKey: 'business_id',
        });

    };

    return BusinessUser;
};
