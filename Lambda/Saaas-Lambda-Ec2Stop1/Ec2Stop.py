#!/usr/bin/env python
# Python 3.x / Boto 3 for Lambda

import boto3
import datetime
import time
import sys
import logging
import os
import json
import uuid
from datetime import datetime, timedelta
from dateutil.tz import tzutc
from dateutil import parser
from dateutil.relativedelta import relativedelta
from croniter import croniter
from concurrent.futures import ThreadPoolExecutor
from timeit import default_timer as timer

# Default Tag
REGION = os.environ.get("AWS_DEFAULT_REGION")
TAG_STOP_SCHEDULE = 'Stop Schedule'
TAG_NEXT_SCHEDULED_STOP = 'Next Scheduled Stop'

log = logging.getLogger()
log.setLevel(logging.INFO)

###############################################################################


class AWSClient(object):
    def __init__(self, assumedRoleCredentials, region):
        
        # Initialize Resource
        self.resource = boto3.resource(
            'ec2',
            aws_access_key_id = assumedRoleCredentials['Credentials']['AccessKeyId'],
            aws_secret_access_key = assumedRoleCredentials['Credentials']['SecretAccessKey'],
            aws_session_token = assumedRoleCredentials['Credentials']['SessionToken'],
            region_name = region
        )
        # Initialize Client
        self.client = boto3.client(
            'ec2',
            aws_access_key_id = assumedRoleCredentials['Credentials']['AccessKeyId'],
            aws_secret_access_key = assumedRoleCredentials['Credentials']['SecretAccessKey'],
            aws_session_token = assumedRoleCredentials['Credentials']['SessionToken'],
            region_name = region
        )
        self.reference_time = datetime.now(tzutc())

    def taglist_to_dict(self, taglist=[]):
        dictionary = {}
        if taglist != None:
            for tagkv in taglist:
                dictionary[tagkv['Key']] = tagkv['Value']
        return dictionary

    def get_ec2_instances_with_stopschedule(self):
        instances_filtered = []
        reservations = self.client.describe_instances(
            Filters=[
                {'Name': 'tag-key', 'Values': [TAG_STOP_SCHEDULE]}
            ]
        ).get(
            'Reservations', []
        )

        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        # Only add instance if TAG_STOP_SCHEDULE tag is NOT empty
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if len(ec2tags[TAG_STOP_SCHEDULE]) >= 1:
                instances_filtered.append(ec2inst)

        return instances_filtered

    def get_ec2_instances_with_nextscheduledstop(self):
        instances_filtered = []
        reservations = self.client.describe_instances(
            Filters=[
                {'Name': 'tag-key', 'Values': [TAG_NEXT_SCHEDULED_STOP]}
            ]
        ).get(
            'Reservations', []
        )

        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        # Only add instance if TAG_NEXT_SCHEDULED_STOP tag is NOT empty
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if len(ec2tags[TAG_NEXT_SCHEDULED_STOP]) >= 1:
                instances_filtered.append(ec2inst)

        return instances_filtered

    def get_instances_need_stopping(self, instances):
        instances_need_stopping = []
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if TAG_NEXT_SCHEDULED_STOP in ec2tags.keys() and len(ec2tags[TAG_NEXT_SCHEDULED_STOP]) >= 1:
                # Make sure Stop Schedule tag wasn't deleted
                if TAG_STOP_SCHEDULE in ec2tags.keys() and len(ec2tags[TAG_STOP_SCHEDULE]) >=1:
                    if parser.parse(ec2tags[TAG_NEXT_SCHEDULED_STOP]) < self.reference_time:
                        instances_need_stopping.append(ec2inst)
                # If it was deleted, remove scheduled stop tag
                else:
                    self.client.delete_tags(
                        Resources=[ec2inst['InstanceId']],
                        Tags=[
                            {
                                'Key': TAG_NEXT_SCHEDULED_STOP
                            }
                        ]
                    )
        return instances_need_stopping

    def get_single_ec2_instance(self, ec2instid):
        reservations = self.client.describe_instances(InstanceIds=[ec2instid]).get(
            'Reservations', []
        )
        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        return instances[0]

    def schedule_next_stop(self, instances):
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if TAG_STOP_SCHEDULE in ec2tags.keys() and len(ec2tags[TAG_STOP_SCHEDULE]) >= 1:
                try:
                    nextscheduledstop = croniter(
                        ec2tags[TAG_STOP_SCHEDULE], self.reference_time).get_next(datetime)
                    # Create/Update tag if doesn't exist or is invalid
                    if TAG_NEXT_SCHEDULED_STOP not in ec2tags.keys() or len(ec2tags[TAG_NEXT_SCHEDULED_STOP]) < 1 or nextscheduledstop != ec2tags[TAG_NEXT_SCHEDULED_STOP]:
                        self.client.create_tags(
                            Resources=[ec2inst['InstanceId']],
                            Tags=[
                                {
                                    'Key': TAG_NEXT_SCHEDULED_STOP,
                                    'Value': nextscheduledstop.strftime("%Y-%m-%d %H:%M:%S UTC")
                                }
                            ]
                        )
                except ValueError:
                    log.info("Instance {instance} has invalid cron syntax: {cron}".format(
                        instance=ec2inst['InstanceId'], cron=ec2tags[TAG_STOP_SCHEDULE]))

    def calculateCharge(self, ec2inst):
        charge = 0
        instanceType = ec2inst['InstanceType']
        instanceSize = instanceType[instanceType.rindex('.')+1:]

        if (instanceSize == 'nano'):
            charge = 0.005
        elif (instanceSize == 'micro'):
            charge = 0.01
        elif (instanceSize == 'small'):
            charge = 0.02
        elif (instanceSize == 'medium'):
            charge = 0.035
        elif (instanceSize == 'large'):
            charge = 0.06
        elif (instanceSize == 'xlarge'):
            charge = 0.08
        elif (instanceSize == '2xlarge'):
            charge = 0.10
        elif (instanceSize == '4xlarge'):
            charge = 0.12
        elif (instanceSize == '8xlarge'):
            charge = 0.14
        elif (instanceSize == '10xlarge'):
            charge = 0.16
        elif (instanceSize == '12xlarge'):
            charge = 0.18
        elif (instanceSize == '16xlarge'):
            charge = 0.20
        elif (instanceSize == '24xlarge'):
            charge = 0.20
        elif (instanceSize == '32xlarge'):
            charge = 0.20
        elif (instanceSize == '64xlarge'):
            charge = 0.20
        else:
            charge = 0.005

        return charge

    def stop_instances(self, instances, event):
        # Initialize client for recording transaction into DynamoDb
        dynamodbClient = boto3.client('dynamodb')
        
        # Loop through all instances and stop them
        for ec2inst in instances:
            self.client.stop_instances(
                InstanceIds=[ec2inst['InstanceId']]
            )

            charge = str(self.calculateCharge(ec2inst))
            
            dynamodbClient.put_item(
                TableName=os.environ['DynamoDbTableNameTransactions'],
                Item={
                    'userId_yearMonth': {
                        'S': event['userId'] + '_' + self.reference_time.strftime('%Y%m'),
                    },
                    'dateTime_transactionId': {
                        'S': datetime.utcnow().isoformat()+'Z_' + str(uuid.uuid4()),
                    },
                    'featureType': {
                        'S': 'ec2-stop',
                    },
                    'accountId': {
                        'S': event['accountId'],
                    },
                    'region': {
                        'S': event['region'],
                    },
                    "accountType": {
                        'S': 'aws',
                    },
                    "charge": {
                        'N': charge,
                    },
                    "instanceSize": {
                        'S': ec2inst['InstanceType'],
                    }
                }
            )


def lambda_handler(event, context):
    
    # Initialize client for connecting to client accounts
    sts_client = boto3.client('sts')
    assumedRoleCredentials = sts_client.assume_role(
        RoleArn='arn:aws:iam::' + event['accountId'] + ':role/SaaaS_Cloud',
        RoleSessionName='SaaaS_Cloud_Ec2Stop',
        ExternalId='SaaaS_Cloud'
    )

    awsclient = AWSClient(assumedRoleCredentials, event['region'])

    # Get all instances with TAG_NEXT_SCHEDULED_STOP tag
    instances_nextscheduledstop_tag = awsclient.get_ec2_instances_with_nextscheduledstop()
    log.info("{count} instance(s) with {tag} tag.".format(
        count=len(instances_nextscheduledstop_tag), tag=TAG_NEXT_SCHEDULED_STOP))

    # Get all instances with TAG_STOP_SCHEDULE tag
    instances_stopschedule_tag = awsclient.get_ec2_instances_with_stopschedule()
    log.info("{count} instance(s) with {tag} tag.".format(
        count=len(instances_stopschedule_tag), tag=TAG_STOP_SCHEDULE))

    # Get EC2 instances that need to be stopped
    instances_need_stopping = awsclient.get_instances_need_stopping(
        instances_nextscheduledstop_tag)
    log.info("{count} instances need to be stopped.".format(
        count=len(instances_need_stopping)))

	# Stop EC2 instances
    awsclient.stop_instances(instances_need_stopping, event)

	# Schedule next stop
    awsclient.schedule_next_stop(instances_stopschedule_tag)