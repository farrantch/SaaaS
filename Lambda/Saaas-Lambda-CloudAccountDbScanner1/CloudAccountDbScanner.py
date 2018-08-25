import boto3
import os
from boto3.dynamodb.conditions import Key, Attr
from multiprocessing import Process
import json

#DYNAMODB_CONCURRENT_SCANS = 1

featureBatchQueue = []

def InvokeLambdaDistributer(lambdaClient, function, features): #accountId, region, userId):
    tempString = '{ "features": ' + json.dumps(features) + '}' #'{"accountId":"' + accountId + '","region":"' + region + '","userId":"' + userId + '"}'
    lambdaClient.invoke(
        FunctionName=function,
        InvocationType='Event',
        Payload=tempString
    )

def Distribute(drainQueue):
    lambdaClient = boto3.client('lambda')
    processes = []
    
    # If queue count > BATCH_GROUP_SIZE, invoke CloudAccountDistributer with batch size of BATCH_GROUP_SIZE
    global featureBatchQueue
    while len(featureBatchQueue) >= int(os.environ['DistributionBatchSize']):
        
        # Create batch array of features from queue
        featureBatchGroup = featureBatchQueue[:int(os.environ['DistributionBatchSize'])]

        # Remove features from queue
        if len(featureBatchQueue) != int(os.environ['DistributionBatchSize']):
            featureBatchQueue = featureBatchQueue[int(os.environ['DistributionBatchSize'])+1:]
        else:
            featureBatchQueue = []

        # Invoke CloudAccountDistributer with feature
        process = Process(target=InvokeLambdaDistributer, args=(lambdaClient, os.environ['LambdaArnCloudAccountDistributer'], featureBatchGroup[:]))
        processes.append(process)

    if  (drainQueue):
        if (len(featureBatchQueue) > 0): 
            process = Process(target=InvokeLambdaDistributer, args=(lambdaClient, os.environ['LambdaArnCloudAccountDistributer'], featureBatchQueue[:]))
            processes.append(process)
            featureBatchQueue = []

    # Start processes
    for process in processes:
        process.start()

    # make sure that all processes have finished
    for process in processes:
        process.join()

def BatchFeatures(responseItems):

    featureCount = 0
    # For each account
    for account in responseItems:
        # For each region enabled within an account
        for region in account['regions']:
            for feature in region['features']:
                featureCount += 1
                tempFeature = feature
                tempFeature['accountId'] = account['accountId']
                tempFeature['regionName'] = region['name']
                tempFeature['userId'] = account['userId']

                global featureBatchQueue
                featureBatchQueue.append(tempFeature)

    Distribute(False)
    return featureCount

    
def lambda_handler(event, context):
    
    featureCount = 0
    accountCount = 0

    # Initialize Clients
    dynamodbClient = boto3.resource('dynamodb')
    
    # Get Table
    table = dynamodbClient.Table(os.environ['DynamoDbTableNameCloudAccounts'])

    # Start Initial Scan Processes    
    # Get all accounts
    response = table.scan(
        Limit = int(os.environ['DynamoDbScanSize']),
        ConsistentRead = False,
        ReturnConsumedCapacity = 'TOTAL'
    )
    scanCount = 1
    accountCount += len(response['Items'])

    print("Scan #" + str(scanCount) + ". Read Capacity Consumed:" + str(response['ConsumedCapacity']))

    # Add Features to Feature Queue
    featureCount = BatchFeatures(response['Items'])

    # While items still in table
    while('LastEvaluatedKey' in response):
        # Scan table again
        response = table.scan(
            Limit = int(os.environ['DynamoDbScanSize']),
            ConsistentRead = False,
            ReturnConsumedCapacity = 'TOTAL',
            ExclusiveStartKey=response['LastEvaluatedKey']
        )

        scanCount += 1
        accountCount += len(response['Items'])

        # Add Features to Feature Queue
        featureCount += BatchFeatures(response['Items'])
        print("Scan #" + str(scanCount) + ". Read Capacity Consumed:" + str(response['ConsumedCapacity']))
        
            
    # Drain Queue
    Distribute(True)

    print (str(accountCount) + " accounts scanned.")
    print (str(featureCount) + " total features.")
    print (str(scanCount) + " paginated DB scans performed.")
    print ("CloudAccounts DB Scan Complete.")