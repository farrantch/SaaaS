import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

function validateUser() {
  return true
}

export async function main(event, context, callback) {
  // Get Users table name
  var tableNameUsers = process.env.tableNameUsers;
  
  const data = JSON.parse(event.body);
  const params = {
    TableName: tableNameUsers,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      //accountId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET stripeCustomer = :stripeCustomer",
    ExpressionAttributeValues: {
      ":stripeCustomer": data.stripeCustomer ? data.stripeCustomer : null,
      //":email": data.email ? data.email : null
    },
    ReturnValues: "ALL_NEW"
  };

  let isValid =  validateUser();

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}