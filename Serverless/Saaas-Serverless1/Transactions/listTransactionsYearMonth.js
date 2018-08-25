import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";
import Datetime from "react-datetime";

export async function main(event, context, callback) {

  console.log("Environment: " + JSON.stringify(process.env));
  console.log("Event: " + JSON.stringify(event));
  console.log("Context: " + JSON.stringify(context));
  // Get Transactions table name
  var tableNameTransactions = process.env.tableNameTransactions;

  const data = JSON.parse(event.body);

  //console.log(event.requestContext);
  let path = event.requestContext.path;
  let yearMonth = path.substr(path.lastIndexOf('/') + 1);

  const params = {
    TableName: tableNameTransactions,
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "userId_yearMonth = :userId_yearMonth",
    ExpressionAttributeValues: {
      ":userId_yearMonth": event.requestContext.identity.cognitoIdentityId + "_" + yearMonth
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}