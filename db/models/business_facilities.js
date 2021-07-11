const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const BusinessFacility = sequelize.define('business_facilities', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        facility_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },

        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },

        businessList: DataTypes.VIRTUAL,

    }, Object.assign({}, defaultOptions));

    BusinessFacility.associate = (models) => {

        BusinessFacility.belongsTo(models.facilities, {
            foreignKey: 'facility_id'
        });

        BusinessFacility.belongsTo(models.business, {
            foreignKey: 'business_id'
        });

    };

    return BusinessFacility;
};
