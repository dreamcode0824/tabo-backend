const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Reviews = sequelize.define('review', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        review: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        rate: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

    }, Object.assign({}, defaultOptions));

    Reviews.associate = (models) => {

        Reviews.belongsTo(models.customer, {
            foreignKey: 'customer_id'
        });

        Reviews.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

        Reviews.belongsTo(models.reservation, {
            foreignKey: 'reservation_id',
            allowNull: true,
        });

    };

    return Reviews;
};
