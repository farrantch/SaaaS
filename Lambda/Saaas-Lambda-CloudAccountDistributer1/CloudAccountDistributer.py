import boto3
import os
from multiprocessing import Process

def InvokeLambda(lambdaClient, function, accountId, region, userId):
    tempString = '{"accountId":"' + accountId + '","region":"' + region + '","userId":"' + userId + '"}'
    lambdaClient.invoke(
        FunctionName=function,
        InvocationType='Event',
        Payload=tempString
    )
    
def lambda_handler(event, context):

    # Get features from event
    features = event['features']
    
    # Initialize Clients
    lambdaClient = boto3.client('lambda')

    # create a list to keep all processes
    processes = []
    
    # For each account
    for feature in features:
        # For each region enabled within an account
        # for region in account['regions']:
        #     for feature in region['features']:
                #If feature is enabled, add to appropriate message queue.

        if (feature['name'] == 'ec2-start'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnEc2Start'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'ec2-stop'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnEc2Stop'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'ec2-reboot'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnEc2Reboot'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'ec2-backup-manager'):
           process = Process(target=InvokeLambda, args=(lambdaClient,os.environ['LambdaArnEc2BackupManager'], feature['accountId'], feature['regionName'], feature['userId']))
           processes.append(process)
        elif (feature['name'] == 'rds-start'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnRdsStart'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'rds-stop'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnRdsStop'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'rds-reboot'):
            process = Process(target=InvokeLambda, args=(lambdaClient, os.environ['LambdaArnRdsReboot'], feature['accountId'], feature['regionName'], feature['userId']))
            processes.append(process)
        elif (feature['name'] == 'rds-backup-manager'):
           process = Process(target=InvokeLambda, args=(lambdaClient,os.environ['LambdaArnRdsBackupManager'], feature['accountId'], feature['regionName'], feature['userId']))
           processes.append(process)
        #if (region['ChaosManager')
        #if (region[Ec2Resize])
        #if (region[RdsResize])
        #if (region[Ec2DynamicDns]
        #if (region[RdsDynamicDns]
    
            
    print ("Number of features to distribute: " + str(len(features)))
                
    # start all processes
    for process in processes:
        process.start()
        
    # make sure that all processes have finished
    for process in processes:
        process.join()