const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessElement = sequelize.define('business_element', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        position: {
            type: DataTypes.JSON,
            allowNull: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            default: false
        },
        rotate_angle: {
            type: DataTypes.FLOAT,
        },
        is_vip: {
            type: DataTypes.BOOLEAN,
            default: false
        },
        table_number: {
            type: DataTypes.STRING,
        },
        unique_id: {
            type: DataTypes.INTEGER,
        },
    }, Object.assign({}, defaultOptions));

    BusinessElement.associate = (models) => {

        BusinessElement.belongsTo(models.element, {
            foreignKey: 'element_id'
        });

        BusinessElement.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

        BusinessElement.belongsTo(models.zone, {
            foreignKey: 'zone_id'
        });

    };

    return BusinessElement;
};
