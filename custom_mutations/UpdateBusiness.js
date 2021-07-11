const {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQL
} = require('graphql');
const { GraphQLUpload } = require('apollo-server-core/node_modules/graphql-upload');
const bcrypt = require('bcrypt');
const fileUploadHelper = require('../helpers/fileUpload');

const db = require('../db');
const {businessObjectType} = require('../schemas/business');
const type = new GraphQLInputObjectType({
  name: 'BusinessType',
  fields: {
    id: {
      type: GraphQLInt
    },
    name:{
      type:GraphQLString
    },
    representative_first_name:{
      type:GraphQLString
    },
    representative_last_name:{
      type:GraphQLString
    },
    description:{
      type:GraphQLString
    },
    id_card_file: {
      type: GraphQLUpload
    },
    identification_file: {
      type: GraphQLUpload
    },
    additional_document_file: {
      type: GraphQLUpload
    },
  }
});
const processUpload = async (upload, id,type) => {
  const { createReadStream, filename, mimetype } = await upload;

  const result = await fileUploadHelper.s3.upload({ // (C)
    Bucket: process.env.BUCKET_NAME,
    ACL: 'private',
    Body: createReadStream(),               
    Key: `${id}-${type}-${extname(filename)}`,  
    ContentType: mimetype                   
  }).promise();                             

  return result; 
}
module.exports = {
  type: new GraphQLObjectType({
    name: 'UpdateBusiness',
    fields: {
        business: {
            type: businessObjectType
        }
    }
  }),
  args: {
    input: {type}
  },
  resolve: async (source, {input}, context, info) => {
    // if (!context.user) {
    //   throw Errors.Authorization();
    // }
    // console.log(client)
    const { id,name,representative_first_name, representative_last_name, description } = input;
    const idCardFile = await input.id_card_file;
    const idCardFileResult = await processUpload(idCardFile,id,'id-card');
    let business = await db.models.business.findOne({
      where: {
          id
        }
    });    
    const identificationFile = await input.identification_file;
    const identificationFileResult = await processUpload(identificationFile,id,'identification');
    const additionalDocumentFile = await input.additional_document_file;
    const additionalDocumentFileResult = await processUpload(additionalDocumentFile,id,'additional-document');
    business = await business.update({
      name,
      representative_first_name,
      representative_last_name,
      description,
      id_card_file_name: idCardFileResult.filename,
      identification_file_name:identificationFileResult.fitename,
      additional_document_file_name:additionalDocumentFileResult.fitename,
    })
    return {business};
  }
};