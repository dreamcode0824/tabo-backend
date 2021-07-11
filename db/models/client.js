const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const Client = sequelize.define('client', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "VALIDATION.REGISTER.CLIENT.PHONE.TAKEN"
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      unique: {
        args: true,
        msg: "VALIDATION.REGISTER.CLIENT.EMAIL.TAKEN"
      }
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      values: ['Owner', 'Administrator', 'Company Representative', 'Manager'],
      allowNull: false,
      defaultValue: 'Owner'
    },
    interested_in: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      values: ['Pending', 'Accept', 'Suspended', 'Reject'],
      allowNull: false,
      defaultValue: 'Pending'
    },
    password_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_pass_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    time_link: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, Object.assign({}, defaultOptions));

  Client.associate = (models) => {

    Client.belongsTo(models.country, {
      foreignKey: 'country_id',
    });

    Client.belongsTo(models.city, {
      foreignKey: 'city_id',
    })

  };

  return Client;
};
