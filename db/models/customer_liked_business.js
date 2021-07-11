const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const CustomerLikedBusiness = sequelize.define('customer_liked_business', {

    }, Object.assign({}, defaultOptions));

    CustomerLikedBusiness.associate = (models) => {

        CustomerLikedBusiness.belongsTo(models.customer, {
            foreignKey: 'customer_id',
        });

        CustomerLikedBusiness.belongsTo(models.business, {
            foreignKey: 'business_id',
        });

    };

    return CustomerLikedBusiness;
};
