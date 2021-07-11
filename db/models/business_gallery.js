const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessGallery = sequelize.define('business_gallery', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        url: {
            type: DataTypes.STRING,
            allowNull: false
        },

        is_main: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

    }, Object.assign({}, defaultOptions));

    BusinessGallery.associate = (models) => {

        BusinessGallery.belongsTo(models.business, {
            foreignKey: 'business_id',
        });

    };

    return BusinessGallery;
};
