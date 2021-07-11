const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessAvailableElement = sequelize.define('business_available_elements', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

    }, Object.assign({}, defaultOptions));

    BusinessAvailableElement.associate = (models) => {

        BusinessAvailableElement.belongsTo(models.element, {
            foreignKey: 'element_id'
        });

        BusinessAvailableElement.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessAvailableElement;
};
