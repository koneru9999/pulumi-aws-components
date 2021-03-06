import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { alphaNumericFilter } from '../utils'

export type S3Event =
  | 's3:ObjectCreated:*'
  | 's3:ObjectCreated:Put'
  | 's3:ObjectCreated:Post'
  | 's3:ObjectCreated:Copy'
  | 's3:ObjectCreated:CompleteMultipartUpload'
  | 's3:ObjectRemoved:*'
  | 's3:ObjectRemoved:Delete'
  | 's3:ObjectRemoved:DeleteMarkerCreated'
  | 's3:ObjectRestore:Post'
  | 's3:ObjectRestore:Completed'
  | 's3:ReducedRedundancyLostObject'
  | 's3:Replication:OperationFailedReplication'
  | 's3:Replication:OperationMissedThreshold'
  | 's3:Replication:OperationReplicatedAfterThreshold'
  | 's3:Replication:OperationNotTracked'

/**
 * notifications to be filtered by the prefix and suffix of the key name of objects.
 *
 * Notification configurations cannot define filtering rules with overlapping prefixes, overlapping suffixes,
 * or overlapping combinations of prefixes and suffixes for the same event types.
 */
export interface S3NotificationQueueFilterRule {
  /**
   * notifications to be filtered by the prefix of the key name of objects.
   */
  filterPrefix?: string

  /**
   * notifications to be filtered by the suffix of the key name of objects.
   */
  filterSuffix?: string
}

/**
 * Args for `S3NotificationQueue`
 */
export interface S3NotificationQueueArgs extends Omit<aws.sqs.QueueArgs, 'name' | 'namePrefix'> {
  /**
   * Bucket to create notifications for.
   */
  bucket: aws.s3.Bucket

  events: S3Event[]

  /**
   * Events filter criteria. A new bucket notification will be created for each entry.
   * Notification configurations cannot define filtering rules with overlapping prefixes, overlapping suffixes,
   * or overlapping combinations of prefixes and suffixes for the same event types.
   */
  notificationFilterRules: S3NotificationQueueFilterRule[]
}

/**
 * Creates a SQS queue and configures notification(s) to the given bucket.
 */
export class S3NotificationQueue extends pulumi.ComponentResource {
  readonly queue: aws.sqs.Queue
  readonly queuePolicy: aws.sqs.QueuePolicy
  readonly bucketNotification: aws.s3.BucketNotification

  constructor(name: string, args: S3NotificationQueueArgs, opts?: pulumi.CustomResourceOptions) {
    super('aws:components:S3NotificationQueue', name, args, opts)

    // Default resource options for this component's child resources.
    const defaultResourceOptions: pulumi.ResourceOptions = { parent: this }

    const { bucket, notificationFilterRules, events, ...queueArgs } = args

    // Queue
    const queueName = name
    this.queue = new aws.sqs.Queue(
      queueName,
      {
        ...queueArgs,
        name: queueArgs.fifoQueue ? `${queueName}.fifo` : queueName
      },
      defaultResourceOptions
    )

    const queuePermissionName = `${queueName}-s3-permission`
    this.queuePolicy = new aws.sqs.QueuePolicy(
      queuePermissionName,
      {
        queueUrl: this.queue.id,
        policy: pulumi.all([bucket.arn, this.queue.arn]).apply(([bucketArn, queueArn]) =>
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: 'SQS:SendMessage',
                Resource: [queueArn],
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': bucketArn
                  }
                }
              }
            ]
          })
        )
      },
      defaultResourceOptions
    )

    const bucketNotificationName = `${name}-${events.map(event => alphaNumericFilter(event)).join('-')}`
    this.bucketNotification = new aws.s3.BucketNotification(
      bucketNotificationName,
      {
        bucket: args.bucket.id,
        queues: notificationFilterRules.map(notificationFilterRule => ({
          id: `${bucketNotificationName}${
            notificationFilterRule.filterPrefix ? alphaNumericFilter(notificationFilterRule.filterPrefix) : ''
          }${notificationFilterRule.filterSuffix ? alphaNumericFilter(notificationFilterRule.filterSuffix) : ''}`,
          queueArn: this.queue.arn,
          events,
          filterPrefix: notificationFilterRule.filterPrefix,
          filterSuffix: notificationFilterRule.filterSuffix
        }))
      },
      { ...defaultResourceOptions, dependsOn: this.queuePolicy }
    )

    this.registerOutputs({
      queue: this.queue,
      queuePolicy: this.queuePolicy,
      bucketNotification: this.bucketNotification
    })
  }
}
