const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const PlanChanges = sequelize.define('plan_changes', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        plan_config: {
            type: DataTypes.JSON,
            allowNull: false
        },

        status: {
            type: DataTypes.STRING,
            // values: ['pending', 'updated'],
            // defaultValue: 'pending',
            allowNull: false
        },

    }, Object.assign({}, defaultOptions));

    PlanChanges.associate = (models) => {

        PlanChanges.belongsTo(models.business, {
            foreignKey: 'business_id',
            allowNull: false
        });

    };


    return PlanChanges;
};
