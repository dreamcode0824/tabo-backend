const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessTerms = sequelize.define('business_terms', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        terms: {
            type: DataTypes.TEXT,// + ' CHARSET utf8 COLLATE utf8_general_ci',
            default: null
        },

    }, Object.assign({}, defaultOptions));

    BusinessTerms.associate = (models) => {

        BusinessTerms.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessTerms;
};
