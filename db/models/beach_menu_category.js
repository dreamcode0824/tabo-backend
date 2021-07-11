const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BeachMenuCategory = sequelize.define('beach_menu_category', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        title: {
            type: DataTypes.JSON,
            default: false
        },

    }, Object.assign({}, defaultOptions));

    BeachMenuCategory.associate = (models) => {

        BeachMenuCategory.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BeachMenuCategory;
};
