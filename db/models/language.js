const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Languages = sequelize.define('language', {

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        long_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

    }, Object.assign({}, defaultOptions));

    return Languages;
};
