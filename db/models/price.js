const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Price = sequelize.define('price', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        price: {
            type: DataTypes.JSON,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        seat_count: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        start_date: {
            type: DataTypes.STRING,
            allowNull: true
        },
        end_date: {
            type: DataTypes.STRING,
            allowNull: true
        },

    }, Object.assign({}, defaultOptions));

    Price.associate = (models) => {

        Price.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

        Price.belongsTo(models.element, {
            foreignKey: 'element_id'
        });

        Price.belongsTo(models.zone, {
            foreignKey: 'zone_id',
            allowNull: true
        });

    };

    return Price;
};
