// Purpose: Defines S3 buckets for assets and booksheets.
// TODO: Create S3 bucket carinv-<env>-assets with SSE and versioning.
// TODO: Create S3 bucket carinv-<env>-booksheets with SSE and versioning.
// TODO: Configure event notification on booksheets/raw/ to Textract SNS topic.

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

interface StorageStackProps extends cdk.StackProps {
  // envName: string; // To prefix bucket names
}

export class StorageStack extends cdk.Stack {
  public readonly assetsBucket: s3.Bucket;
  public readonly booksheetsBucket: s3.Bucket;
  public readonly textractSnsTopic: sns.Topic; // To be used by OcrPipelineStack

  constructor(scope: cdk.App, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const envName = this.node.tryGetContext('env') || 'dev'; // Default to 'dev' if not provided

    // S3 bucket for general assets (e.g., frontend static assets if not using Amplify hosting directly, images)
    this.assetsBucket = new s3.Bucket(this, `AssetsBucket`, {
      bucketName: `carinv-${envName}-assets`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Or DESTROY for non-prod
      autoDeleteObjects: envName !== 'prod', // Useful for non-prod environments
    });

    // S3 bucket for book sheets (e.g., uploaded images for OCR)
    this.booksheetsBucket = new s3.Bucket(this, `BooksheetsBucket`, {
      bucketName: `carinv-${envName}-booksheets`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: envName !== 'prod',
    });

    // SNS Topic for Textract completion notifications (can also be created in OcrPipelineStack)
    this.textractSnsTopic = new sns.Topic(this, `TextractCompletionTopic`, {
      topicName: `TextractCompletionTopic-${envName}`,
    });

    // Configure S3 event notification for new objects in 'raw/' prefix of booksheetsBucket
    // This will trigger the OCR pipeline (e.g., by publishing to an SNS topic or SQS queue)
    this.booksheetsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.SnsDestination(this.textractSnsTopic),
      { prefix: 'raw/' } // Only trigger for objects in the 'raw/' folder
    );

    new cdk.CfnOutput(this, 'AssetsBucketNameOutput', {
      value: this.assetsBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'BooksheetsBucketNameOutput', {
      value: this.booksheetsBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'TextractSnsTopicArnOutput', {
      value: this.textractSnsTopic.topicArn,
    });

    console.log('TODO: Review S3 bucket policies, lifecycle rules, and specific Textract notification setup.');
  }
}
