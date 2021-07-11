const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const City = sequelize.define('city', {

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

        state_code: {
            type: DataTypes.STRING,
        },

        country_code: {
            type: DataTypes.CHAR(2),
        },

        latitude: {
            type: DataTypes.DECIMAL(10,8),
        },

        longitude: {
            type: DataTypes.DECIMAL(10,8),
        },

        flag: {
            type: DataTypes.BOOLEAN,
        },

        // wiki_data_id: {
        //     type: DataTypes.STRING,
        // },


    }, Object.assign({}, defaultOptions));

    City.associate = (models) => {

        City.belongsTo(models.country, {
            foreignKey: 'country_id'
        });

        City.belongsTo(models.state, {
            foreignKey: 'state_id'
        });

    };

    // exclude this model for sequelize.sync()
    City.sync = () => Promise.resolve();

    return City;
};
