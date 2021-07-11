const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    //   `country_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
    //   `fips_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //   `iso2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //   `created_at` timestamp NULL DEFAULT NULL,
    //   `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //   `flag` tinyint(1) NOT NULL DEFAULT '1',
    //   `wikiDataId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'

    const State = sequelize.define('state', {

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

        country_code: {
            type: DataTypes.CHAR(2),
        },

        fips_code: {
            type: DataTypes.STRING,
        },

        iso2: {
            type: DataTypes.STRING,
        },

        flag: {
            type: DataTypes.BOOLEAN,
        },

        wikiDataId: {
            type: DataTypes.STRING,
        },

    }, Object.assign({}, defaultOptions));

    State.associate = (models) => {

        State.belongsTo(models.country, {
            foreignKey: 'country_id'
        });

    };

    // exclude this model for sequelize.sync()
    State.sync = () => Promise.resolve();

    return State;
};
