import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

function validateAccount(params) {
  return true;
}

export async function main(event, context, callback) {
  // Get CloudAccounts table name
  var tableNameCloudAccounts = process.env.tableNameCloudAccounts;
  
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  console.log(event);

  const params = {
    TableName: tableNameCloudAccounts,
    // 'Item' contains the attributes of the item to be created
    // - 'userId': user identities are federated through the
    //             Cognito Identity Pool, we will use the identity id
    //             as the user id of the authenticated user
    // - 'noteId': a unique uuid
    // - 'content': parsed from request body
    // - 'attachment': parsed from request body
    // - 'createdAt': current Unix timestamp
    Item: {
      accountType: data.accountType,
      userId: event.requestContext.identity.cognitoIdentityId,
      accountId: data.accountId,
      accountName: data.accountName,
      createdAt: new Date().getTime(),
      regions: data.regions
    }
  };

  let isValid = validateAccount(params);

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}