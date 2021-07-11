const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

  const Business = sequelize.define('business', {

    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    number: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },

    status: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM,
      // values: ['inactive', 'pending-approval', 'approved', 'published', 'suspended'],
      defaultValue: 'inactive'
    },

    type: {
      type: DataTypes.STRING,
      // type: DataTypes.ENUM,
      // values: [beach, pool, restaurant, terrace, club],
    },

    representative_first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    representative_last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    representative_birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },

    representative_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    representative_email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    zipcode: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },

    reg_com_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    capital_social: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    bank_account: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    bank_routing_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    bank_account_holder_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    vat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    vat_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    cui_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },

    id_card_file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    identification_file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    additional_document_file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // can be moved to a separate table
    plan_config: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },

    avg_rate: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true
    },

    location: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      unique: true,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          // return next();
          Business.findOne({ where: { location_name: value, client_id: self.client_id } })
            .then(function (business) {
              if (business && (business.id != self.id)) {
                return next('Location name already in use!');
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        }
      }

    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    offer: DataTypes.TEXT,

  }, Object.assign({}, defaultOptions));

  Business.associate = (models) => {

    Business.belongsTo(models.client, {
      foreignKey: 'client_id',
    });

    Business.hasMany(models.business_gallery, {
      as: 'gallery',
      foreignKey: 'business_id',
    });

    Business.belongsTo(models.country, {
      foreignKey: 'country_id'
    });

    Business.belongsTo(models.city, {
      foreignKey: 'city_id'
    });

    Business.hasOne(models.business_settings, {
      as: 'settings',
      foreignKey: 'business_id',
    });

    Business.hasOne(models.business_rules, {
      as: 'rules',
      foreignKey: 'business_id',
    });
    Business.hasMany(models.business_facilities, {
      as: 'facilities',
      foreignKey: 'business_id',
    });
    Business.hasMany(models.business_element, {
      as: 'elements',
      foreignKey: 'business_id',
    });
    Business.hasOne(models.business_week, {
      as: 'business_week',
      foreignKey: 'business_id',
    });
    Business.hasMany(models.price, {
      as: 'price',
      foreignKey: 'business_id',
    });
    Business.hasOne(models.business_year, {
      as: 'activity_period',
      foreignKey: 'business_id',
    });
    Business.hasMany(models.zone, {
      as: 'zone',
      foreignKey: 'business_id',
    });
    Business.hasMany(models.validated_coupons, {
      as: 'couponList',
      foreignKey: 'business_id',
    });

  };

  return Business;
};
