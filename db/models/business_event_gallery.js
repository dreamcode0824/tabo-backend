const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessEventGallery = sequelize.define('business_event_gallery', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        type: {
            type: DataTypes.STRING,
            allowNull: false,
            //['photo', 'video']
        },

        thumbnail: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        index: {
            type: DataTypes.INTEGER
        }

    }, Object.assign({}, defaultOptions));

    BusinessEventGallery.associate = (models) => {

        BusinessEventGallery.belongsTo(models.business_event, {
            foreignKey: 'business_event_id'
        });

    };

    return BusinessEventGallery;
};
