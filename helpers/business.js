const bcrypt = require('bcrypt');
const db = require('../db');

const getByPhone = async phone => {
    return await db.models.customer.findOne({
        where: {
            phone,
        }
    })
};

const verifyPassword = async (p1, p2) => {
    return await bcrypt.compare(p1, p2);
};

const getByPassword = async (phone, password) => {
    try {
        const customer = await getByPhone(phone);
        if(!customer) return null;

        const isValid = await verifyPassword(password, customer.password);

        return isValid ? customer : null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

const updateAndGetCustomer = async (id, email, cardHolderName) => {
    const customer = await db.customer.findOne({
        where: {
            id
        }
    });

    let toSave = false;

    if (email && email.length > 0) {
        customer.email = email;
        toSave = true;
    }

    if (cardHolderName && cardHolderName.length > 0) {
        customer.name = cardHolderName;
        toSave = true;
    }

    if (toSave) {
        await customer.save();
    }

    return customer;
};

module.exports = {
    getByPhone,
    getByPassword,
    verifyPassword,
    updateAndGetCustomer,
};
