const defaultOptions = require('../defaultOptions');

module.exports = (sequelize, DataTypes) => {

    const ReservationSeat = sequelize.define('reservation_seat', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            default: false
        },

    }, Object.assign({}, defaultOptions));

    ReservationSeat.associate = (models) => {

        ReservationSeat.belongsTo(models.reservation, {
            foreignKey: 'reservation_id'
        });

        ReservationSeat.belongsTo(models.seat, {
            foreignKey: 'seat_id'
        });

    };

    return ReservationSeat;
};
