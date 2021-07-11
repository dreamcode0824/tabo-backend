const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BeachMenuItem = sequelize.define('beach_menu_item', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        price: {
            type: DataTypes.FLOAT,
            default: null
        },

        currency: {
            type: DataTypes.STRING,
            default: null
        },

        image: {
            type: DataTypes.STRING,
            default: null
        },

        title: {
            type: DataTypes.JSON,
            default: null
        },

        description: {
            type: DataTypes.JSON,
            default: null
        },

    }, Object.assign({}, defaultOptions));

    BeachMenuItem.associate = (models) => {

        BeachMenuItem.belongsTo(models.beach_menu_category, {
            foreignKey: 'beach_menu_category_id'
        });

        BeachMenuItem.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BeachMenuItem;
};
