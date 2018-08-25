import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

function validateUser() {
  return true
}

export async function main(event, context, callback) {
  // Get Users table name
  var tableNameUsers = process.env.tableNameUsers;
  
  //var stripe = require("stripe")("sk_test_ePwz6f7eLefPlI0D34EQm4kv");

  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  //   // Create a Customer:
  // var customer = stripe.customers.create({
  //   email: data.email,
  //   source: data.token,
  // });

  const params = {
    TableName: tableNameUsers,
    // 'Item' contains the attributes of the item to be created
    // - 'userId': user identities are federated through the
    //             Cognito Identity Pool, we will use the identity id
    //             as the user id of the authenticated user
    // - 'noteId': a unique uuid
    // - 'content': parsed from request body
    // - 'attachment': parsed from request body
    // - 'createdAt': current Unix timestamp
    Item: {
      //name: data.name,
      userId: event.requestContext.identity.cognitoIdentityId,
      email: data.email,
      //paymentMethodId: uuid.v1(),
      //createdAt: new Date().getTime(),
      //response: data.response,
      //customer: customer,
      stripeCustomer: data.stripeCustomer
    }
  };

  let isValid =  validateUser();

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}