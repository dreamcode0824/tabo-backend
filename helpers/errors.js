
const Authorization = () => {
  return new Error('Not authorized');
};

const MissingParam = (name) => {
  return new Error(`${name} parameter is missing.`);
};
const CouponInvalid = () => {
  return new Error('This coupon is invalid');
};
const CouponExistingInvalid = () => {
  return new Error('This coupon already is used');
};
const PlanSaveInvalid = () => {
  return new Error('You can\'t create plan twice each month');
};
module.exports = {
  Authorization,
  MissingParam,
  CouponInvalid,
  CouponExistingInvalid,
  PlanSaveInvalid
};
