const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Facilities = sequelize.define('facilities', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        icon: {
            type: DataTypes.TEXT,
            allowNull: true
        },

    }, Object.assign({}, defaultOptions));

    return Facilities;
};
