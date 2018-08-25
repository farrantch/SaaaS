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
TAG_BACKUP_TYPE = 'Backup Type'
TAG_BACKUP_SCHEDULE = 'Backup Schedule'
TAG_NEXT_SCHEDULED_BACKUP = 'Next Scheduled Backup'
TAG_BACKUP_RETENTION = 'Backup Retention'

log = logging.getLogger()
log.setLevel(logging.INFO)

###############################################################################


class AWSClient(object):
    def __init__(self, assumedRoleCredentials, region):
        
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

    def get_rds_instances_with_backupschedule(self):
        # instances_filtered = []
        instances = self.client.describe_db_instances(
            # Filters=[
            #     {'Name': 'tag-key', 'Values': [TAG_BACKUP_SCHEDULE]},
            #     {'Name': 'instance-state-name',
            #         'Values': ['running', 'stopped']}
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

        # Only add instance if TAG_BACKUP_SCHEDULE tag is NOT empty
        return self.filter_rds_instances_by_tag(instances, TAG_BACKUP_SCHEDULE)

    def get_rds_instances_with_nextscheduledbackup(self):
        instances_filtered = []
        instances = self.client.describe_db_instances(
        ).get(
            'DBInstances', []
        )

        # Get tags for all instances
        for rdsinst in instances:
            # Add taglist to instance object
            rdsinst['Tags'] = self.client.list_tags_for_resource(ResourceName=rdsinst['DBInstanceArn'])['TagList']
            # Only include instance if available to backup
            if (rdsinst['DBInstanceStatus'] == 'available' ):
                instances_filtered.append(rdsinst)

        # Only add instance if TAG_BACKUP_SCHEDULE tag is NOT empty
        return self.filter_rds_instances_by_tag(instances_filtered, TAG_BACKUP_SCHEDULE)
    
    def filter_rds_instances_by_tag(self, instances, tagName):
        instances_filtered = []
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if (tagName in rdstags):
                if (len(rdstags[tagName]) >= 1):
                    instances_filtered.append(rdsinst)

        return instances_filtered

    def get_snapshots(self):
        snapshots = self.client.describe_db_snapshots(
        ).get(
            'DBSnapshots', []
        )
        return snapshots

    def get_snapshots_from_instance(self, instanceid):
        snapshots = self.client.describe_db_snapshots(
            DBInstanceIdentifier=instanceid,
            SnapshotType='manual'
        ).get(
            'DBSnapshots', []
        )
        return snapshots

    def filter_instances_past_due(self, instances):
        instances_filtered = []
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if TAG_NEXT_SCHEDULED_BACKUP in rdstags.keys() and len(rdstags[TAG_NEXT_SCHEDULED_BACKUP]) >= 1:
                # Make sure backup schedule tag exists
                if TAG_BACKUP_SCHEDULE in rdstags.keys() and len(rdstags[TAG_BACKUP_SCHEDULE]) >= 1:
                    # If past due, add to list
                    if parser.parse(rdstags[TAG_NEXT_SCHEDULED_BACKUP]) < self.reference_time:
                        instances_filtered.append(rdsinst)
                # Delete NextScheduledBackup tag if BackupSchedule tag doesn't exist
                else:
                    self.client.remove_tags_from_resource(
                        ResourceName=rdsinst['DBInstanceArn'],
                        TagKeys=[ TAG_NEXT_SCHEDULED_BACKUP ]
                    )
        return instances_filtered

    def filter_instances_without_backupnextscheduledrun_tag(self, instances):
        instances_filtered = []
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if TAG_NEXT_SCHEDULED_BACKUP not in rdstags.keys() or len(rdstags[TAG_NEXT_SCHEDULED_BACKUP]) < 1:
                instances_filtered.append(rdsinst)
        return instances_filtered

    def backuptype_reboot(self, rdsinst, rebootOption):
        
        self.create_ami(rdsinst, rebootOption)

    def begin_backups(self, instances, event):
        # Initialize client for recording transaction into DynamoDb
        dynamodbClient = boto3.client('dynamodb')
        
        for rdsinst in instances:
            # Get instance tags
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            # Default backup type
            if TAG_BACKUP_TYPE not in rdstags.keys() or len(rdstags[TAG_BACKUP_TYPE]) < 1:
                backup_type = DEFAULT_BACKUP_TYPE
            else:
                backup_type = rdstags[TAG_BACKUP_TYPE]

            # Determine backup type
            if backup_type == 'Reboot':
                self.backuptype_reboot(rdsinst, False)
            elif backup_type == 'NoReboot':
                self.backuptype_reboot(rdsinst, True)
            else:
                log.info("{instance} has unrecognized backup type tag: {backuptype}.".format(
                    instance=rdsinst['InstanceId'], backuptype=backup_type))

            # Calculate Charge
            charge = str(self.calculateCharge(rdsinst))
            
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
                        'S': 'rds-backup-manager',
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

    def create_ami(self, rdsinst, rebootOption):
        log.info("Creating AMI for {instance}".format(
            instance=rdsinst['DBInstanceIdentifier']))
        rdstags = self.taglist_to_dict(rdsinst['Tags'])
        expiration_date = None
        if TAG_BACKUP_RETENTION in rdstags.keys() and len(rdstags[TAG_BACKUP_RETENTION]) >= 1:
            retention_policy = rdstags[TAG_BACKUP_RETENTION].replace(
                " ", "").split('.')

            try:
                # Is this the first backup (baseline) for this particular instance?
                instance_snapshots = self.get_snapshots_from_instance(rdsinst['DBInstanceIdentifier'])

                # Yearly backup if day matches or is baseline backup
                if (self.reference_time.timetuple().tm_yday == DEFAULT_DAY_YEARLY_BACKUP or len(instance_snapshots) < 1) and int(retention_policy[3]) >= 1:
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
                        instance=rdsinst['DBInstanceIdentifier']))
            except Exception:
                log.info("Instance {instance} backup retention tag formatted incorrectly: {tagvalue}".format(
                instance=rdsinst['DBInstanceIdentifier'], tagvalue=rdstags[TAG_BACKUP_RETENTION]))

        # rdsobj = self.client.describe_db_instances(DBInstanceIdentifier=rdsinst['DBInstanceIdentifier'])
        aminame = rdsinst['DBInstanceIdentifier'] + '-' + \
            self.reference_time.strftime("%Y-%m-%d-%H-%M-%S-UTC")
        rdsSnapshot = self.client.create_db_snapshot(
            DBSnapshotIdentifier=aminame,
            DBInstanceIdentifier=rdsinst['DBInstanceIdentifier']
            )['DBSnapshot']

        # If retention policy set
        if expiration_date:
            img_expiration_tag = [
                {
                    "Key": "Expiration Date",
                    "Value": expiration_date.strftime("%Y-%m-%d %H:%M:%S UTC")
                }
            ]
            self.client.add_tags_to_resource(
                ResourceName=rdsSnapshot['DBSnapshotArn'],
                Tags=img_expiration_tag
            )
        # If rds instance has name
        if 'Name' in rdstags.keys() and len(rdstags['Name']) >= 1:
            img_name_tag = [
                {
                    "Key": "Name",
                    "Value": rdstags['Name']
                }
            ]
            self.client.add_tags_to_resource(
                ResourceName=rdsSnapshot['DBSnapshotArn'],
                Tags=img_name_tag
            )

    def convert_cron_rds_syntax(self, inputString):
        inputString = inputString.replace('.', ',')
        inputString = inputString.replace('=', '#')
        inputString = inputString.replace('+', '*')
        #inputString = inputString.replace('_', ':')
        return inputString

    def schedule_next_backups(self, instances):
        for rdsinst in instances:
            rdstags = self.taglist_to_dict(rdsinst['Tags'])
            if TAG_BACKUP_SCHEDULE in rdstags.keys() and len(rdstags[TAG_BACKUP_SCHEDULE]) >= 1:
                try:
                    nextscheduledbackup = croniter(
                        self.convert_cron_rds_syntax(rdstags[TAG_BACKUP_SCHEDULE]), self.reference_time).get_next(datetime)
                    # Create/Update tag if doesn't exist or is invalid
                    if TAG_NEXT_SCHEDULED_BACKUP not in rdstags.keys() or len(rdstags[TAG_NEXT_SCHEDULED_BACKUP]) < 1 or nextscheduledbackup != rdstags[TAG_NEXT_SCHEDULED_BACKUP]:
                        self.client.add_tags_to_resource(
                            ResourceName=rdsinst['DBInstanceArn'],
                            Tags=[
                                {
                                    'Key': TAG_NEXT_SCHEDULED_BACKUP,
                                    'Value': nextscheduledbackup.strftime("%Y-%m-%d %H:%M:%S UTC")
                                }
                            ]
                        )
                except ValueError:
                    log.info("Instance {instance} has invalid cron syntax: {cron}".format(
                        instance=rdsinst['InstanceId'], cron=rdstags[TAG_BACKUP_SCHEDULE]))

    def cleanup_expired_snapshots(self, snapshots):
        for snapshot in snapshots:
            snapshot['Tags'] = self.client.list_tags_for_resource(ResourceName=snapshot['DBSnapshotArn'])['TagList']
            snapshot_tags = self.taglist_to_dict(snapshot['Tags'])
            if 'Expiration Date' in snapshot_tags.keys() and len(snapshot_tags['Expiration Date']) >= 1 and parser.parse(self.convert_cron_rds_syntax(snapshot_tags['Expiration Date'])) < self.reference_time:
                self.delete_snapshot(snapshot)

    def delete_snapshot(self, snapshot):
        log.info("Deleting Snapshot: {snapshot}".format(snapshot=snapshot['DBSnapshotIdentifier']))
        self.client.delete_db_snapshot(DBSnapshotIdentifier=snapshot['DBSnapshotIdentifier'])
        # Delete snapshots for the AMI by looking at the description
        # snapshots = self.resource.snapshots.filter(Filters=[
        #     {'Name': 'description', 'Values': ["*%s*" % snapshot['DBSnapshotIdentifier']]},
        # ]
        # )
        # for snapshot in snapshots:
        #     snapshot.delete()

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


# Borrowed from http://victorlin.me/posts/2012/08/26/good-logging-practice-in-python


def lambda_handler(event, context):

    # Initialize client for connecting to client accounts
    sts_client = boto3.client('sts')
    assumedRoleCredentials = sts_client.assume_role(
        RoleArn='arn:aws:iam::' + event['accountId'] + ':role/SaaaS_Cloud',
        RoleSessionName='SaaaS_Cloud_RdsBackupManager',
        ExternalId='SaaaS_Cloud'
    )

    awsclient = AWSClient(assumedRoleCredentials, event['region'])

    # Get all instances with TAG_NEXT_SCHEDULED_BACKUP tag
    instances_nsb_tag = awsclient.get_rds_instances_with_nextscheduledbackup()
    log.info("{count} instance(s) with {tag_nextscheduledbackup} tag.".format(
        count=len(instances_nsb_tag), tag_nextscheduledbackup=TAG_NEXT_SCHEDULED_BACKUP))

    # Get all instances with TAG_BACKUP_SCHEDULE tag
    instances_backupschedule_tag = awsclient.get_rds_instances_with_backupschedule()
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

    # Cleanup expired snapshots
    awsclient.cleanup_expired_snapshots(awsclient.get_snapshots())