import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

function validateAccount() {
  return true;
}

export async function main(event, context, callback) {
  // Get CloudAccounts table name
  var tableNameCloudAccounts = process.env.tableNameCloudAccounts;
  
  const data = JSON.parse(event.body);
  const params = {
    TableName: tableNameCloudAccounts,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      accountId: event.pathParameters.id
    },
    UpdateExpression: "SET accountType = :accountType, accountName = :accountName, regions = :regions",
    ExpressionAttributeValues: {
      ":accountType": data.accountType ? data.accountType : null,
      ":accountName": data.accountName ? data.accountName : null,
      ":regions": data.regions ? data.regions : null
    },
    ReturnValues: "ALL_NEW"
  };

  let isValid = validateAccount(params);

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}