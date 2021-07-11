const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Offer = sequelize.define('offer', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        info: {
            type: DataTypes.STRING,
            allowNull: false
        },

        options: {
            type: DataTypes.STRING,
        },

    }, Object.assign({}, defaultOptions));

    Offer.associate = (models) => {

        Offer.belongsTo(models.business_element, {
            foreignKey: 'business_element_id'
        });

    };

    return Offer;
};
