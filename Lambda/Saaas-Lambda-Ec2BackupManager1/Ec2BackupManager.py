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
DEFAULT_BACKUP_TYPE = 'NoReboot'
DEFAULT_DAY_WEEKLY_BACKUP = 6  # Sunday
DEFAULT_DAY_MONTHLY_BACKUP = 1 # 1st day of month
DEFAULT_DAY_YEARLY_BACKUP = 1  # 1st day of the year
DEFAULT_BACKUP_RENTENTION = 7,0,0,0
TAG_BACKUP_TYPE = 'Backup Type'
TAG_BACKUP_SCHEDULE = 'Backup Schedule'
TAG_NEXT_SCHEDULED_BACKUP = 'Next Scheduled Backup'
TAG_BACKUP_RETENTION = 'Backup Retention'

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

    def get_ec2_instances_with_backupschedule(self):
        instances_filtered = []
        reservations = self.client.describe_instances(
            Filters=[
                {'Name': 'tag-key', 'Values': [TAG_BACKUP_SCHEDULE]},
                {'Name': 'instance-state-name',
                    'Values': ['running', 'stopped']}
            ]
        ).get(
            'Reservations', []
        )

        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        # Only add instance if TAG_BACKUP_SCHEDULE tag is NOT empty
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if len(ec2tags[TAG_BACKUP_SCHEDULE]) >= 1:
                instances_filtered.append(ec2inst)

        return instances_filtered

    def get_ec2_instances_with_nextscheduledbackup(self):
        instances_filtered = []
        reservations = self.client.describe_instances(
            Filters=[
                {'Name': 'tag-key', 'Values': [TAG_NEXT_SCHEDULED_BACKUP]},
                {'Name': 'instance-state-name',
                    'Values': ['running', 'stopped']}
            ]
        ).get(
            'Reservations', []
        )

        instances = sum(
            [
                [i for i in r['Instances']]
                for r in reservations
            ], [])

        # Only add instance if TAG_NEXT_SCHEDULED_BACKUP tag is NOT empty
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if len(ec2tags[TAG_NEXT_SCHEDULED_BACKUP]) >= 1:
                instances_filtered.append(ec2inst)

        return instances_filtered

    def get_images(self):
        images = self.client.describe_images(
            Filters=[
                {'Name': 'tag-key', 'Values': ['InstanceId']},
                {'Name': 'state', 'Values': ['available']},
            ]
        ).get(
            'Images', []
        )
        return images

    def get_images_from_instance(self, instanceid):
        images = self.client.describe_images(
            Filters=[
                {'Name': 'tag:InstanceId', 'Values': [instanceid]},
                {'Name': 'state', 'Values': ['available']},
            ]
        ).get(
            'Images', []
        )
        return images

    def filter_instances_past_due(self, instances):
        instances_filtered = []
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if TAG_NEXT_SCHEDULED_BACKUP in ec2tags.keys() and len(ec2tags[TAG_NEXT_SCHEDULED_BACKUP]) >= 1:
                # Make sure backup schedule tag exists
                if TAG_BACKUP_SCHEDULE in ec2tags.keys() and len(ec2tags[TAG_BACKUP_SCHEDULE]) >= 1:
                    # If past due, add to list
                    if parser.parse(ec2tags[TAG_NEXT_SCHEDULED_BACKUP]) < self.reference_time:
                        instances_filtered.append(ec2inst)
                # Delete NextScheduledBackup tag if BackupSchedule tag doesn't exist
                else:
                    self.client.delete_tags(
                        Resources=[ec2inst['InstanceId']],
                        Tags=[
                            {
                                'Key': TAG_NEXT_SCHEDULED_BACKUP
                            }
                        ]
                    )
        return instances_filtered

    def filter_instances_without_backupnextscheduledrun_tag(self, instances):
        instances_filtered = []
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if TAG_NEXT_SCHEDULED_BACKUP not in ec2tags.keys() or len(ec2tags[TAG_NEXT_SCHEDULED_BACKUP]) < 1:
                instances_filtered.append(ec2inst)
        return instances_filtered

    def backuptype_reboot(self, ec2inst, rebootOption):
        
        self.create_ami(ec2inst, rebootOption)

    def begin_backups(self, instances, event):
        # Initialize client for recording transaction into DynamoDb
        dynamodbClient = boto3.client('dynamodb')
        
        for ec2inst in instances:
            # Get instance tags
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            # Default backup type
            if TAG_BACKUP_TYPE not in ec2tags.keys() or len(ec2tags[TAG_BACKUP_TYPE]) < 1:
                backup_type = DEFAULT_BACKUP_TYPE
            else:
                backup_type = ec2tags[TAG_BACKUP_TYPE]

            # Determine backup type
            if backup_type == 'Reboot':
                self.backuptype_reboot(ec2inst, False)
            elif backup_type == 'NoReboot':
                self.backuptype_reboot(ec2inst, True)
            else:
                log.info("{instance} has unrecognized backup type tag: {backuptype}.".format(
                    instance=ec2inst['InstanceId'], backuptype=backup_type))

            # Calculate Charge
            charge = str(self.calculateCharge(ec2inst))
            
            # Record Charge
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
                        'S': 'ec2-backup-manager',
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

    def add_years(self, d, years):
        """Return a date that's `years` years after the date (or datetime)
        object `d`. Return the same calendar date (month and day) in the
        destination year, if it exists, otherwise use the following day
        (thus changing February 29 to March 1).

        """
        try:
            return d.replace(year=d.year + years)
        except ValueError:
            return d + (datetime(d.year + years, 1, 1) - datetime(d.year, 1, 1))

    def create_ami(self, ec2inst, rebootOption):
        log.info("Creating AMI for {instance}".format(
            instance=ec2inst['InstanceId']))
        ec2tags = self.taglist_to_dict(ec2inst['Tags'])
        expiration_date = None
        if TAG_BACKUP_RETENTION in ec2tags.keys() and len(ec2tags[TAG_BACKUP_RETENTION]) >= 1:
            retention_policy = ec2tags[TAG_BACKUP_RETENTION].replace(
                " ", "").split(',')

            try:
                # Is this the first backup (baseline) for this particular instance?
                instance_images = self.get_images_from_instance(ec2inst['InstanceId'])

                # Yearly backup if day matches or is baseline backup
                if (self.reference_time.timetuple().tm_yday == DEFAULT_DAY_YEARLY_BACKUP or len(instance_images) < 1) and int(retention_policy[3]) >= 1:
                    expiration_date = self.add_years(
                        self.reference_time, int(retention_policy[3]))
                # Monthly backup
                elif self.reference_time.day == DEFAULT_DAY_MONTHLY_BACKUP and int(retention_policy[2]) >= 1:
                    expiration_date = self.reference_time + \
                        relativedelta(months=+int(retention_policy[2]))
                # Weekly backup
                elif self.reference_time.weekday() == DEFAULT_DAY_WEEKLY_BACKUP and int(retention_policy[1]) >= 1:
                    expiration_date = self.reference_time + \
                        timedelta(weeks=int(retention_policy[1]))
                elif int(retention_policy[0]) >= 1:
                    expiration_date = self.reference_time + \
                        timedelta(days=int(retention_policy[0]))
                else:
                    log.info("No backup scheduled today for {instance} instance.".format(
                        instance=ec2inst['InstanceId']))
            except Exception:
                log.info("Instance {instance} backup retention tag formatted incorrectly: {tagvalue}".format(
                instance=ec2inst['InstanceId'], tagvalue=ec2tags[TAG_BACKUP_RETENTION]))

        # Set the ec2 source tag for the AMI
        img_tags = [
            {
                "Key": "InstanceId",
                "Value": ec2inst['InstanceId']
            }
        ]
        ec2obj = self.resource.Instance(ec2inst['InstanceId'])
        aminame = ec2inst['InstanceId'] + '_' + \
            self.reference_time.strftime("%Y-%m-%d-%H%M%S-UTC")
        ec2image = ec2obj.create_image(Name=aminame, NoReboot=rebootOption)
        ec2image.create_tags(Tags=img_tags)
        # If retention policy set
        if expiration_date:
            img_expiration_tag = [
                {
                    "Key": "Expiration Date",
                    "Value": expiration_date.strftime("%Y-%m-%d %H:%M:%S UTC")
                }
            ]
            ec2image.create_tags(Tags=img_expiration_tag)
        # If ec2 instance has name
        if 'Name' in ec2tags.keys() and len(ec2tags['Name']) >= 1:
            img_name_tag = [
                {
                    "Key": "Name",
                    "Value": ec2tags['Name']
                }
            ]
            ec2image.create_tags(Tags=img_name_tag)

    def schedule_next_backups(self, instances):
        for ec2inst in instances:
            ec2tags = self.taglist_to_dict(ec2inst['Tags'])
            if TAG_BACKUP_SCHEDULE in ec2tags.keys() and len(ec2tags[TAG_BACKUP_SCHEDULE]) >= 1:
                try:
                    nextscheduledbackup = croniter(
                        ec2tags[TAG_BACKUP_SCHEDULE], self.reference_time).get_next(datetime)
                    # Create/Update tag if doesn't exist or is invalid
                    if TAG_NEXT_SCHEDULED_BACKUP not in ec2tags.keys() or len(ec2tags[TAG_NEXT_SCHEDULED_BACKUP]) < 1 or nextscheduledbackup != ec2tags[TAG_NEXT_SCHEDULED_BACKUP]:
                        self.client.create_tags(
                            Resources=[ec2inst['InstanceId']],
                            Tags=[
                                {
                                    'Key': TAG_NEXT_SCHEDULED_BACKUP,
                                    'Value': nextscheduledbackup.strftime("%Y-%m-%d %H:%M:%S UTC")
                                }
                            ]
                        )
                except ValueError:
                    log.info("Instance {instance} has invalid cron syntax: {cron}".format(
                        instance=ec2inst['InstanceId'], cron=ec2tags[TAG_BACKUP_SCHEDULE]))

    def cleanup_expired_images(self, images):
        for image in images:
            image_tags = self.taglist_to_dict(image['Tags'])
            if 'Expiration Date' in image_tags.keys() and len(image_tags['Expiration Date']) >= 1 and parser.parse(image_tags['Expiration Date']) < self.reference_time:
                self.delete_image(image)

    def delete_image(self, image):
        log.info("Deleting AMI: {image}".format(image=image['ImageId']))
        self.client.deregister_image(ImageId=image['ImageId'])
        # Delete snapshots for the AMI by looking at the description
        snapshots = self.resource.snapshots.filter(Filters=[
            {'Name': 'description', 'Values': ["*%s*" % image['ImageId']]},
        ]
        )
        for snapshot in snapshots:
            snapshot.delete()

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


# Borrowed from http://victorlin.me/posts/2012/08/26/good-logging-practice-in-python


def lambda_handler(event, context):

    # Initialize client for connecting to client accounts
    sts_client = boto3.client('sts')
    assumedRoleCredentials = sts_client.assume_role(
        RoleArn='arn:aws:iam::' + event['accountId'] + ':role/SaaaS_Cloud',
        RoleSessionName='SaaaS_Cloud_Ec2BackupManager',
        ExternalId='SaaaS_Cloud'
    )

    awsclient = AWSClient(assumedRoleCredentials, event['region'])

    # Get all instances with TAG_NEXT_SCHEDULED_BACKUP tag
    instances_nsb_tag = awsclient.get_ec2_instances_with_nextscheduledbackup()
    log.info("{count} instance(s) with {tag_nextscheduledbackup} tag.".format(
        count=len(instances_nsb_tag), tag_nextscheduledbackup=TAG_NEXT_SCHEDULED_BACKUP))

    # Get all instances with TAG_BACKUP_SCHEDULE tag
    instances_backupschedule_tag = awsclient.get_ec2_instances_with_backupschedule()
    log.info("{count} instance(s) with {tag_backupschedule} tag.".format(
        count=len(instances_backupschedule_tag), tag_backupschedule=TAG_BACKUP_SCHEDULE))

    # Get instances past due to run a backup
    instances_past_due = awsclient.filter_instances_past_due(
        instances_nsb_tag)
    log.info("{count} instance(s) scheduled to backup now.".format(
        count=len(instances_past_due)))

    # Run backups on instances past due
    awsclient.begin_backups(instances_past_due, event)

    # Schedule Backups
    awsclient.schedule_next_backups(instances_backupschedule_tag)

    # Cleanup expired images
    awsclient.cleanup_expired_images(awsclient.get_images())