const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    return sequelize.define('custom_query', {

        name: DataTypes.VIRTUAL,
        result: DataTypes.VIRTUAL(DataTypes.JSON),

    }, Object.assign({}, defaultOptions));

};
