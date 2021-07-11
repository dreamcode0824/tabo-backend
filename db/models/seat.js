const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Seat = sequelize.define('seat', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        index: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            default: false
        },

    }, Object.assign({}, defaultOptions));

    Seat.associate = (models) => {

        Seat.belongsTo(models.business_element, {
            foreignKey: 'business_element_id'
        });

        Seat.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return Seat;
};
