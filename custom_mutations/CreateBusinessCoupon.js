const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
} = require('graphql');
const bcrypt = require('bcrypt');
const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(`${process.env.SEND_EMAIL_API_KEY}`);
const db = require('../db');
const Errors = require('../helpers/errors');

const type = new GraphQLInputObjectType({
  name: 'BusinessCoupon',
  fields: {
    business_id: {
      type: GraphQLInt
    },
    code: {
      type: GraphQLString
    },
  }
});
module.exports = {
  type: new GraphQLObjectType({
    name: 'CreateBusinessCoupon',
    fields: {
      id: {
        type: GraphQLInt
      },
      coupon_id: {
        type: GraphQLInt
      },
      name: {
        type: GraphQLString
      },
      value: {
        type: GraphQLFloat
      }
    }
  }),
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    // if (!context.user) {
    //   throw Errors.Authorization();
    // }
    const { business_id, code } = input;
    const coupon = await db.models.all_coupons.findOne({
      where: {
        code,
      }
    });
    if (!coupon) {
      throw Errors.CouponInvalid();
    }
    const businessCoupon = await db.models.validated_coupons.findOne({
      where: {
        coupon_id: coupon.id
      }
    })
    const existingBusinessCoupon = await db.models.validated_coupons.findOne({
      where: {
        coupon_id: coupon.id,
        business_id
      }
    })
    if (coupon && existingBusinessCoupon) {
      throw Errors.CouponExistingInvalid();
    }
    if (coupon && coupon.type == 'individual' && (coupon.status == 'active' || business_id != coupon.business_id)) {
      throw Errors.CouponInvalid();
    } else {
      if (coupon.type == 'individual') {
        coupon.status = 'active';
        coupon.save();
      }
    }
    const client = await db.models.validated_coupons.create({
      coupon_id: coupon.id,
      business_id,
      coupon: coupon.coupon,
      value: coupon.value,
      code: coupon.code
    });
    if (client) {
      function getMessage() {
        let body = "The plan is changed."
        return {
          to: process.env.FROM_EMAIL,
          from: process.env.FROM_EMAIL,
          subject: 'The plan is changed.',
          text: body,
          html: `<div>
                <strong>${client.coupon} is added</strong><br/>            
              </div>`,
        };
      }
      async function sendEmail() {
        try {
          await sendGridMail.send(getMessage());
          console.log('Test email sent successfully');
        } catch (error) {
          console.error('Error sending test email');
          console.error(error);
          if (error.response) {
            console.error(error.response.body)
          }
        }
      }
      (async () => {
        console.log('Sending test email');
        await sendEmail();
      })();
    }
    return { id: client.id, coupon_id: coupon.id, name: coupon.coupon, value: coupon.value };
  }
};