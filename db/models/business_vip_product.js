const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessVipProduct = sequelize.define('business_vip_product', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },

    }, Object.assign({}, defaultOptions));

    BusinessVipProduct.associate = (models) => {

        BusinessVipProduct.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessVipProduct;
};
