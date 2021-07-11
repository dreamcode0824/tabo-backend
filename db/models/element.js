const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const Element = sequelize.define('element', {

    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    type: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM,
      // values: ['umbrella', 'baldaquin', 'single', 'cabana', 'table'],
      allowNull: false
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    structure: DataTypes.JSON,

  }, Object.assign({}, defaultOptions));

  return Element;
};
