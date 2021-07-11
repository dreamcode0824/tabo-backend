const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessAd = sequelize.define('business_ad', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    }, Object.assign({}, defaultOptions));

    BusinessAd.associate = (models) => {

        BusinessAd.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessAd;
};
