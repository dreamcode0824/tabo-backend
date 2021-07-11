const bcrypt = require('bcrypt');

const authHelper = require('../helpers/auth');
const fileUploadHelper = require('../helpers/fileUpload');
const db = require('../db');

module.exports = (model) => {
    return {
        model,
        // The followings hooks are just here to demo their signatures.
        // They are not required and can be omitted if you don't need them.
        create: {
            // extraArg: { anotherArg: { type: GraphQLInt } },
            before: async (source, { customer }, context, info) => {
                try {
                    console.log('before create');
                    // console.log(customer);
                    if (
                        !customer.facebook_auth_data &&
                        !customer.google_auth_data &&
                        (!customer.phone || !customer.password)
                    ) {
                        throw new Error('VALIDATION.ALL_FIELDS_REQUIRED');
                    }

                    if (customer.password) {
                        customer.password = await bcrypt.hash(customer.password, 10);
                    }

                    if (customer.facebook_auth_data) {
                        customer.facebook_user_id = customer.facebook_auth_data.id || null;
                        customer.photo = customer.facebook_auth_data.picture;
                        if (customer.facebook_auth_data.name) {
                            const splitted = customer.facebook_auth_data.name.split(' ');
                            customer.first_name = splitted[0];
                            customer.last_name = customer.facebook_auth_data.name
                                .replace(customer.first_name, '')
                                .trim();
                        }
                    }

                    if (customer.google_auth_data) {
                        console.log(customer.google_auth_data);
                        customer.google_user_id = customer.google_auth_data.id;
                        customer.photo = customer.google_auth_data.photo;
                        customer.first_name = customer.google_auth_data.givenName;
                        customer.last_name = customer.google_auth_data.familyName;
                        customer.email = customer.google_auth_data.email;
                        // console.log(customer);
                    }

                    return customer;
                } catch (e) {
                    console.log(e);
                    throw new Error(e);
                }
            },
            after: async (newEntity, source, args, context, info) => {
                console.log('after create');

                newEntity = newEntity.toJSON();
                // if (newEntity.facebook_auth_data) {
                //     const data = await fileUploadHelper.uploadFromUrl(
                //         newEntity.facebook_auth_data.picture,
                //         `customers/profile_photo/${newEntity.id}.jpg`,
                //     );
                //     db.models.customer.update({
                //         photo: data.Location
                //     }, {
                //         where: {
                //             id: newEntity.id
                //         }
                //     });
                // } else
                // if (newEntity.google_auth_data) {
                //     const data = await fileUploadHelper.uploadFromUrl(
                //         newEntity.google_auth_data.photo,
                //         `customers/profile_photo/${newEntity.id}.jpg`,
                //     );
                //     db.models.customer.update({
                //         photo: data.Location
                //     }, {
                //         where: {
                //             id: newEntity.id
                //         }
                //     });
                // }

                newEntity.type = 'customer';
                newEntity.token = authHelper.createToken(newEntity);
                // console.log(newEntity);

                return newEntity;
            },//
        },
        update: {
            before: async (source, { customer }, context, info) => {
                console.log('upadte');
                // console.log(customer);
                const { password, ...customerData } = customer;

                if (customerData.google_auth_data || customerData.facebook_auth_data) {
                    customerData.google_user_id = customerData.google_auth_data ? customerData.google_auth_data.id : null;
                    customerData.facebook_user_id = customerData.facebook_auth_data ? customerData.facebook_auth_data.id : null;
                    context.createToken = true;
                    customerData.password = null;

                    return customerData;
                }

                if (!customerData.phone) {
                    throw new Error('VALIDATION.CUSTOMER.UPDATE.PHONE');
                }
                if (password && password.length > 0) {
                    customer.password = await bcrypt.hash(password, 10);
                }

                return customerData;
            },
            after: async (
                updatedEntity,
                entitySnapshot,
                source,
                args,
                context,
                info
            ) => {

                if (context.createToken) {
                    updatedEntity.type = 'customer';
                    updatedEntity.token = authHelper.createToken(updatedEntity.toJSON());
                }

                return updatedEntity
            },
            //
            subscriptionFilter: (payload, args, context) => {
                // Exemple of subscription check
                if (context.user.role !== 'admin') {
                    return false
                }
                return true
            }
        },
        delete: {
            before: async (where, source, args, context, info) => {
                // You can restrict the creation if needed
                return where
            },
            after: async (deletedEntity, source, args, context, info) => {
                // You can log what happened here
                return deletedEntity
            },
            //
            subscriptionFilter: (payload, args, context) => {
                // Exemple of subscription check
                if (context.user.role !== 'admin') {
                    return false
                }
                return true
            }
        },
    }
};
