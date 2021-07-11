const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessEvent = sequelize.define('business_event', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        visibility: {
            type: DataTypes.STRING,
            allowNull: false,
            // ['public', 'private']
        },

        going: {
            type: DataTypes.INTEGER,
        },

        interested: {
            type: DataTypes.INTEGER,
        },

        reserved: {
            type: DataTypes.INTEGER,
        },

        main: {
            type: DataTypes.STRING,
        },

        thumbnail: {
            type: DataTypes.STRING,
        },

        date: {
            type: DataTypes.DATE
        },

        location_position: {
            type: DataTypes.JSON,
        },

        location_name: {
            type: DataTypes.STRING,
        },

    }, Object.assign({}, defaultOptions));

    BusinessEvent.associate = (models) => {

        BusinessEvent.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessEvent;
};
