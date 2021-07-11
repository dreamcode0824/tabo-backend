const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} = require('graphql');
const bcrypt = require('bcrypt');
const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(`${process.env.SEND_EMAIL_API_KEY}`);
const db = require('../db');
const interested_arr = new GraphQLInputObjectType({
  name: 'interestedin',
  fields: {
    value: { type: GraphQLString },
    label: { type: GraphQLString },
  }
});
const type = new GraphQLInputObjectType({
  name: 'RegisterClient',
  fields: {
    first_name: {
      type: GraphQLString
    },
    last_name: {
      type: GraphQLString
    },
    phone: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    },
    country_id: {
      type: GraphQLInt
    },
    position: {
      type: GraphQLString
    },
    interested_in: {
      type: new GraphQLList(interested_arr)
    },
    // city_id: {
    //     type: GraphQLInt
    // }
  }
});

module.exports = {
  type: new GraphQLObjectType({
    name: 'RegisterClientResult',
    fields: {
      id: {
        type: GraphQLInt
      }
    }
  }),
  args: {
    input: { type }
  },
  resolve: async (source, { input }, context, info) => {
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      country_id,
      position,
      interested_in,
      // city_id,
    } = input;

    if (
      !first_name ||
      !last_name ||
      !phone ||
      !email ||
      // !password ||
      !country_id ||
      !position ||
      !interested_in
      // !city_id
    ) {
      throw new Error('All fields are required');
    }

    try {
      let registerPassword = password;
      const passwordHash = await bcrypt.hash(registerPassword, 10);

      const client = await db.models.client.create({
        first_name,
        last_name,
        phone,
        email,
        password: passwordHash,
        country_id,
        position,
        interested_in,
        // city_id,
      });
      const country = await db.models.country.findOne({
        where: {
          id: client.country_id
        }
      })
      let letter = "";
      if (client.interested_in) {
        if (client.interested_in.length > 0) {
          client.interested_in.map((item, index) => {
            if (index == 0) {
              letter = item.value;
            } else {
              letter = letter + "," + item.value;

            }
          })
        }
      }
      if (client) {
        function getMessage() {
          const body = 'Register';
          return {
            to: process.env.FROM_EMAIL,
            from: process.env.FROM_EMAIL,
            subject: 'Register Information',
            text: body,
            html: `<div>
                <strong>Frist Name: ${client.first_name}</strong><br/>
                <strong>Last Name: ${client.last_name}</strong><br/>
                <strong>Position: ${client.position}</strong><br/>
                <strong>Email: ${client.email}</strong><br/>
                <strong>Phone Number: ${client.phone}</strong><br/>
                <strong>Country: ${country.name}</strong><br/>
                <strong>Interested In: ${letter}</strong><br/>
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
      return { id: client.id, }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
