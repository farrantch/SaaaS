import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context, callback) {
  // Get Users table name
  var tableNameUsers = process.env.tableNameUsers;


  var stripe = require("stripe")(process.env.StripeSecretKey);
  //this.getUser = this.getUser.bind(this);

  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  // Get User in DynamoDB
  let user = null;
  const queryParams = {
    TableName: tableNameUsers,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
    }
  };

  try {
    const result = await dynamoDbLib.call("get", queryParams);
    user = result.Item;
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
    //return null;
  }
  //var user = this.getUser(event.requestContext.identity.cognitoIdentityId);
  if (!user) {
    //callback(null, failure({ status: false, error: "User not found." }));
    callback(null, failure({ status: false }));
  }

  // If not a stripe customer yet, create stipe customer
  if (!user.stripeCustomer) {
    stripe.customers.create({
      metadata: {
        'cognitoIdentityId': event.requestContext.identity.cognitoIdentityId
      },
      description: 'Customer for user ' + event.requestContext.identity.cognitoIdentityId,
      source: data.token.id //obtained with Stripe.js
    }).then(async function(customer) {
      // Update User
      const updateParams = {
        TableName: tableNameUsers,
        Key: {
          userId: event.requestContext.identity.cognitoIdentityId
        },
        UpdateExpression: "SET stripeCustomer = :stripeCustomer",
        ExpressionAttributeValues: {
          ":stripeCustomer": customer,
          //":accountName": data.accountName ? data.accountName : null,
          //":regions": data.regions ? data.regions : null
        },
        ReturnValues: "ALL_NEW"
      };

      try {
        await dynamoDbLib.call("update", updateParams);
        callback(null, success({ status: true }));
      } catch (e) {
        console.log(e);
        callback(null, failure({ status: false }));
      }
    });
  }
  // If already a stripe customer, add card
  else {
    stripe.customers.createSource(user.stripeCustomer.id, {
    source: data.token.id
  }).then(async function(card) {
    // Disregard returned card data
    // Get the latest customer data
    stripe.customers.retrieve(user.stripeCustomer.id
    ).then(async function(customer) {
      // Update the user in dynamodb
      const updateParams = {
        TableName: tableNameUsers,
        Key: {
          userId: event.requestContext.identity.cognitoIdentityId
        },
        UpdateExpression: "SET stripeCustomer = :stripeCustomer",
        ExpressionAttributeValues: {
          ":stripeCustomer": customer,
          //":accountName": data.accountName ? data.accountName : null,
          //":regions": data.regions ? data.regions : null
        },
        ReturnValues: "ALL_NEW"
      };
  
      try {
        await dynamoDbLib.call("update", updateParams);
        callback(null, success({ status: true }));
      } catch (e) {
        console.log(e);
        callback(null, failure({ status: false }));
      }
    });
  });
  }
}