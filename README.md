### Pulumi AWS Components

Collection of custom pulumi resources based on best practices.

[![npm version](https://badge.fury.io/js/pulumi-aws-components.svg)](https://www.npmjs.com/pulumi-aws-components)

#### How to use

```
npm i --save-dev pulumi-aws-components
```

#### Available Components

- [Reusable resource based IAM policies](src/components/policies)
  These policies can be easily attached to IAM role.

- [LambdaFunction](src/components/LambdaFunction.ts)
- [AWS Textract for Async Operations](src/components/AsyncTextract.ts)

  Following are the resource it creates with name `text-extractor-production-pdf`

  ```
    Previewing update :
      Type                                         Name                                                                     Plan
  +   pulumi:pulumi:Stack                          text-extractor-production                                                create
  +   ├─ aws:components:AsyncTextExtract           text-extractor-production-pdf                                            create
  +   │  ├─ aws:s3:BucketEventSubscription         text-extractor-production-pdf-AsyncTextExtractor-onUpload                create
  +   |  │  └─ aws:lambda:Permission               text-extractor-production-pdf-AsyncTextExtractor-onUpload                create
  +   │  ├─ aws:components:EventsQueue             text-extractor-production-pdf-events-queue                               create
  +   │  │  ├─ aws:sqs:Queue                       text-extractor-production-pdf-events-queue                               create
  +   │  │  ├─ aws:sns:TopicSubscription           text-extractor-production-pdf-events-queue-topic-subscription            create
  +   │  │  └─ aws:sqs:QueuePolicy                 text-extractor-production-pdf-events-queue-topic-permission              create
  +   │  ├─ aws:components:LambdaCloudWatchPolicy  text-extractor-production-pdf-cloudwatch-policy                          create
  +   │  │  ├─ aws:cloudwatch:LogGroup             text-extractor-production-pdf-cloudwatch-policy-log-group                create
  +   │  │  └─ aws:iam:Policy                      text-extractor-production-pdf-cloudwatch-policy                          create
  +   │  ├─ aws:sns:Topic                          text-extractor-production-pdf-sns-topic                                  create
  +   │  ├─ aws:iam:Role                           AmazonTextractServiceRoletext-extractor-production-pdf                   create
  +   │  ├─ aws:s3:Bucket                          text-extractor-production-pdf-bucket                                     create
  +   |  |  └─ aws:s3:BucketNotification           text-extractor-production-pdf-AsyncTextExtractor-onUpload                create
  +   │  ├─ aws:lambda:Function                    text-extractor-production-pdf-lambda-callback                            create
  +   │  ├─ aws:iam:RolePolicyAttachment           text-extractor-production-pdf-cloudwatch-policy-attachment               create
  +   │  ├─ aws:iam:RolePolicyAttachment           text-extractor-production-pdf-sns-topic-policy-attachment                create
  +   |  └─ aws:iam:RolePolicyAttachment           text-extractor-production-pdf-textract-policy-attachment                 create
  +   │  └─ aws:iam:RolePolicyAttachment           text-extractor-production-pdf-s3-policy-attachment                       create
  +   |─ aws:components:TextractPolicy             text-extractor-production-pdf-textract-policy                            create
  +   │  └─ aws:iam:Policy                         text-extractor-production-pdf-textract-policy                            create
  +   |─ aws:components:SNSPublishPolicy           text-extractor-production-pdf-sns-topic-policy                           create
  +   │  └─ aws:iam:Policy                         text-extractor-production-pdf-sns-topic-policy                           create
  +   ├─ aws:components:S3ReadWritePolicy          text-extractor-production-pdf-s3-policy                                  create
  +   └─ └─ aws:iam:Policy                         text-extractor-production-pdf-s3-policy                                  create

  Resources:
      + 26 to create
  ```

- [EventsQueue](src/components/EventsQueue.ts)
- [QueueLambda](src/components/QueueLambda.ts)
