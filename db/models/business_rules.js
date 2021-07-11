const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessRules = sequelize.define('business_rules', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        rules: {
            type: DataTypes.JSON,
            default: null
        },

    }, Object.assign({}, defaultOptions));

    BusinessRules.associate = (models) => {

        BusinessRules.belongsTo(models.business, {
            foreignKey: 'business_id'
        });
    };

    return BusinessRules;
};
