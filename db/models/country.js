const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const Country = sequelize.define('country', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        iso3: {
            type: DataTypes.STRING,
        },

        iso2: {
            type: DataTypes.STRING,
        },

        phonecode: {
            type: DataTypes.STRING,
        },

        capital: {
            type: DataTypes.STRING,
        },

        currency: {
            type: DataTypes.STRING,
        },

        native: {
            type: DataTypes.STRING,
        },

        emoji: {
            type: DataTypes.STRING(191),
        },

        emoji_u: {
            type: DataTypes.STRING(191),
        },

        flag: {
            type: DataTypes.BOOLEAN,
        },

        wiki_data_id: {
            type: DataTypes.STRING,
        },

        language: DataTypes.STRING,

    }, Object.assign({}, defaultOptions));

    // exclude this model for sequelize.sync()
    Country.sync = () => Promise.resolve();

    return Country;
};
