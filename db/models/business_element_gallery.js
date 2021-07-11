const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessElement = sequelize.define('business_element_gallery', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        image: {
            type: DataTypes.STRING,
            default: null
        },

        element_type: {
            type: DataTypes.STRING,
            default: null,
            // cabana, sunbed, baldaquin, bed
        }
    }, Object.assign({}, defaultOptions));

    BusinessElement.associate = (models) => {

        BusinessElement.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessElement;
};
