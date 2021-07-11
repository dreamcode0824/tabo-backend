const db = require('../db');
const authHelper = require('./auth');

const getByPhone = async phone => {
  return await db.models.customer.findOne({
    where: {
      phone,
    }
  })
};
const getByName = async name => {
  return await db.models.business_user.findOne({
    where: {
      name,
    }
  })
};

const getByPassword = async (phone, password) => {
  try {
    const customer = await getByPhone(phone);
    if (!customer) return null;

    const isValid = await authHelper.verifyPassword(password, customer.password);

    return isValid ? customer : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const getReceptionLogin = async (name, password) => {
  try {
    console.log(name, password)
    const user = await getByName(name);
    if (!user) return null;
    const isValid = await authHelper.verifyPassword(password, user.password);
    if (isValid) {
      if (user.verified) {
        return user;
      } else {
        return null;
      }
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateAndGetCustomer = async (id, email, cardHolderName) => {
  const customer = await db.models.customer.findOne({
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
  updateAndGetCustomer,
  getReceptionLogin,
};
