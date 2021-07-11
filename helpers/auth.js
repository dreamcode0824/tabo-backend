const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db');

const createToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TOKEN_EXPIRATION_TIME
        }
    );
};

const getCountryInfo = async (iso2) => {
    const country = await db.models.country.findOne({
        where: {
            iso2
        }
    });

    country.phonecode = country.phonecode
        .replace('+', '')
        .replace('-', '');

    return country;
};

const verify = token => {
    if (!token) {
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const verifyPassword = async (p1, p2) => {
    return await bcrypt.compare(p1, p2);
};

module.exports = {
    createToken,
    verify,
    getCountryInfo,
    verifyPassword,
};
