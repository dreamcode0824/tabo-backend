const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Zone = sequelize.define('zone', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        config: DataTypes.JSON,

    }, Object.assign({}, defaultOptions));

    Zone.associate = (models) => {

        Zone.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return Zone;
};
