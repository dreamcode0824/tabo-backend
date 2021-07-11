const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Grid_data = sequelize.define('grid_data', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        data: DataTypes.JSON,

    }, Object.assign({}, defaultOptions));

    Grid_data.associate = (models) => {

        Grid_data.belongsTo(models.business, {
            foreignKey: 'business_id',
        });
    };

    return Grid_data;
};
