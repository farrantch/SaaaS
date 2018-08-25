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
TAG_START_SCHEDULE = 'Start Schedule'
TAG_NEXT_SCHEDULED_START = 'Next Scheduled Start'

log = logging.getLogger()
log.setLevel(logging.INFO)

###############################################################################


class AWSClient(object):
    def __init__(self, assumedRoleCredentials, region):
        
        # Initialize Client
        self.resource = boto3.client(
            'rds',
            aws_access_key_id = assumedRoleCredentials['Credentials']['AccessKeyId'],
            aws_secret_access_key = assumedRoleCredentials['Credentials']['SecretAccessKey'],
            aws_session_token = assumedRoleCredentials['Credentials']['SessionToken'],
            region_name = region
        )
        # Initialize Client
        self.client = boto3.client(
            'rds',
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

    def get_rds_instances_with_startschedule(self):
        #instances_filtered = []
        instances = self.client.describe_db_instances(
            # Filters=[
            #     {'Name': 'tag-key', 'Values': [TAG_START_SCHEDULE]}
            # ]
        ).get(
            'DBInstances', []
        )

        # instances = sum(
        #     [
        #         [i for i in r['Instances']]
        #         for r in reservations
        #     ], [])

        # Get tags for all instances
        for rdsinst in instances:
            rdsinst['Tags'] = self.client.list_tags_for_resource(ResourceName=rdsinst['DBInstanceArn'])['TagList']

        # Only add instance if TAG_START_SCHEDULE tag is NOT empty
        return self.filter_rds_instances_by_tag(instances, TAG_START_SCHEDULE)

    def get_rds_instances_with_nextscheduledstart(self):
        instances_filtered = []
        instances = self.client.describe_db_instances(
            # Filters=[
            #     {'Name': 'tag-key', 'Values': [TAG_NEXT_SCHEDULED_START]}
            # ]
        ).get(
            'DBInstances', []
        )

        # instances = sum(
        #     [
        #         [i for i in r['Instances']]
        #         for r in reservations
        #     ], [])

        # Get tags for all instances
        for rdsinst in instances:
            rdsinst['Tags'] = self.client.list_tags_for_resource(ResourceName=rdsinst['DBInstanceArn'])['TagList']
            # Only include instance if available to start
            if (rdsinst['DBInstanceStatus'] == 'stopped' ):
                instances_filtered.append(rdsinst)

        # Only add instance if TAG_NEXT_SCHEDULED_START tag is NOT empty
        return self.filter_rds_instances_by_tag(instances_filtered, TAG_NEXT_SCHEDULED_START)

    def filter_rds_instances_by_tag(self, instances, tagName):
        instances_filtered = []
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if (tagName in rdstags):
                if (len(rdstags[tagName]) >= 1):
                    instances_filtered.append(rdsinst)

        return instances_filtered

    def get_instances_need_starting(self, instances):
        instances_need_starting = []
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if TAG_NEXT_SCHEDULED_START in rdstags.keys() and len(rdstags[TAG_NEXT_SCHEDULED_START]) >= 1:
                # Make sure Start Schedule tag wasn't deleted
                if TAG_START_SCHEDULE in rdstags.keys() and len(rdstags[TAG_START_SCHEDULE]) >=1:
                    if parser.parse(rdstags[TAG_NEXT_SCHEDULED_START]) < self.reference_time:
                        instances_need_starting.append(rdsinst)
                # If it was deleted, remove scheduled start tag
                else:
                    self.client.remove_tags_from_resource(
                        ResourceName=rdsinst['DBInstanceArn'],
                        TagKeys=[ TAG_NEXT_SCHEDULED_START ]
                    )
        return instances_need_starting

    def get_single_rds_instance(self, rdsinstid):
        reservations = self.client.describe_db_instances(InstanceIds=[rdsinstid]).get(
            'Reservations', []
        )
        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        return instances[0]

    def schedule_next_start(self, instances):
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if TAG_START_SCHEDULE in rdstags.keys() and len(rdstags[TAG_START_SCHEDULE]) >= 1:
                try:
                    nextscheduledstart = croniter(
                        self.convert_cron_rds_syntax(rdstags[TAG_START_SCHEDULE]), self.reference_time).get_next(datetime)
                    # Create/Update tag if doesn't exist or is invalid
                    if TAG_NEXT_SCHEDULED_START not in rdstags.keys() or len(rdstags[TAG_NEXT_SCHEDULED_START]) < 1 or nextscheduledstart != rdstags[TAG_NEXT_SCHEDULED_START]:
                        self.client.add_tags_to_resource(
                            ResourceName=rdsinst['DBInstanceArn'],
                            Tags=[
                                {
                                    'Key': TAG_NEXT_SCHEDULED_START,
                                    'Value': nextscheduledstart.strftime("%Y-%m-%d %H:%M:%S UTC")
                                }
                            ]
                        )
                except ValueError:
                    log.info("Instance {instance} has invalid cron syntax: {cron}".format(
                        instance=rdsinst['DBInstanceIdentifier'], cron=rdstags[TAG_START_SCHEDULE]))

    def convert_cron_rds_syntax(self, inputString):
        inputString = inputString.replace('.', ',')
        inputString = inputString.replace('=', '#')
        inputString = inputString.replace('+', '*')
        #inputString = inputString.replace('_', ':')
        return inputString

    def calculateCharge(self, rdsinst):
        charge = 0
        instanceType = rdsinst['DBInstanceClass']
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

    def start_instances(self, instances, event):
        # Initialize client for recording transaction into DynamoDb
        dynamodbClient = boto3.client('dynamodb')
        
        # Loop through all instances and start them
        for rdsinst in instances:
            self.client.start_db_instance(
                DBInstanceIdentifier=rdsinst['DBInstanceIdentifier']
            )

            charge = str(self.calculateCharge(rdsinst))
            
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
                        'S': 'rds-start',
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
                        'S': rdsinst['DBInstanceClass'],
                    }
                }
            )


def lambda_handler(event, context):
    
    # Initialize client for connecting to client accounts
    sts_client = boto3.client('sts')
    assumedRoleCredentials = sts_client.assume_role(
        RoleArn='arn:aws:iam::' + event['accountId'] + ':role/SaaaS_Cloud',
        RoleSessionName='SaaaS_Cloud_RdsStart',
        ExternalId='SaaaS_Cloud'
    )

    awsclient = AWSClient(assumedRoleCredentials, event['region'])

    # Get all instances with TAG_NEXT_SCHEDULED_START tag
    instances_nextscheduledstart_tag = awsclient.get_rds_instances_with_nextscheduledstart()
    log.info("{count} instance(s) with {tag} tag.".format(
        count=len(instances_nextscheduledstart_tag), tag=TAG_NEXT_SCHEDULED_START))

    # Get all instances with TAG_START_SCHEDULE tag
    instances_startschedule_tag = awsclient.get_rds_instances_with_startschedule()
    log.info("{count} instance(s) with {tag} tag.".format(
        count=len(instances_startschedule_tag), tag=TAG_START_SCHEDULE))

    # Get RDS instances that need to be started
    instances_need_starting = awsclient.get_instances_need_starting(
        instances_nextscheduledstart_tag)
    log.info("{count} instances need to be started.".format(
        count=len(instances_need_starting)))

	# Start RDS instances
    awsclient.start_instances(instances_need_starting, event)

	# Schedule next Start
    awsclient.schedule_next_start(instances_startschedule_tag)