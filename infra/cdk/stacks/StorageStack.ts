// infra/cdk/stacks/StorageStack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
// import * as sns from 'aws-cdk-lib/aws-sns';

export interface StorageStackProps extends cdk.StackProps {
  readonly envName: string;
  readonly projectPrefix: string;
  // readonly textractSnsTopic?: sns.ITopic; // This would be output from OcrPipelineStack if created there, or input if created here.
                                          // For now, assuming OCR pipeline creates its own topic or it's passed differently.
}

export class StorageStack extends cdk.Stack {
  // public readonly assetsBucket: s3.Bucket;
  // public readonly booksheetsBucket: s3.Bucket;
  // public readonly ocrTriggerTopic: sns.Topic; // Topic to trigger OCR workflow

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);
    const { envName, projectPrefix } = props;

    console.log(`StorageStack (${envName}): TODO: Implement S3 buckets (assets, booksheets) and event notifications.`);

    // TODO: Create S3 bucket: ${projectPrefix}-${envName}-assets
    // For public frontend assets if not using Amplify exclusively for hosting, or for other shared assets.
    // Example:
    // this.assetsBucket = new s3.Bucket(this, `${projectPrefix}${envName}AssetsBucket`, {
    //   bucketName: `${projectPrefix}-${envName}-assets`.toLowerCase(), // Bucket names must be lowercase
    //   versioned: true,
    //   encryption: s3.BucketEncryption.S3_MANAGED,
    //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Default, adjust if public assets are intended
    //   removalPolicy: envName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    //   autoDeleteObjects: envName !== 'prod',
    // });
    // new cdk.CfnOutput(this, `${projectPrefix}${envName}AssetsBucketName`, { value: this.assetsBucket.bucketName });


    // TODO: Create S3 bucket: ${projectPrefix}-${envName}-booksheets
    // For OCR input files (e.g., images of book sheets).
    // Example:
    // this.booksheetsBucket = new s3.Bucket(this, `${projectPrefix}${envName}BooksheetsBucket`, {
    //   bucketName: `${projectPrefix}-${envName}-booksheets`.toLowerCase(),
    //   versioned: true,
    //   encryption: s3.BucketEncryption.S3_MANAGED,
    //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    //   removalPolicy: envName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    //   autoDeleteObjects: envName !== 'prod',
    //   cors: [ // Example CORS for allowing uploads from frontend - adjust as needed
    //     {
    //       allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT],
    //       allowedOrigins: ['*'], // TODO: Restrict to frontend domain
    //       allowedHeaders: ['*'],
    //       maxAge: 3000,
    //     }
    //   ]
    // });
    // new cdk.CfnOutput(this, `${projectPrefix}${envName}BooksheetsBucketName`, { value: this.booksheetsBucket.bucketName });

    // TODO: Create an SNS Topic that the booksheetsBucket will notify upon new object creation in 'raw/' prefix.
    // This topic will be used by the OcrPipelineStack to trigger the Textract Lambda.
    // Example:
    // this.ocrTriggerTopic = new sns.Topic(this, `${projectPrefix}${envName}OcrTriggerTopic`, {
    //   displayName: `${projectPrefix}-${envName} OCR Trigger Topic`,
    //   topicName: `${projectPrefix}-${envName}-OcrTriggerTopic`
    // });
    // this.booksheetsBucket.addEventNotification(
    //   s3.EventType.OBJECT_CREATED_PUT,
    //   new s3n.SnsDestination(this.ocrTriggerTopic),
    //   { prefix: 'raw/' } // Only trigger for objects in the 'raw/' folder
    // );
    // new cdk.CfnOutput(this, `${projectPrefix}${envName}OcrTriggerTopicArn`, { value: this.ocrTriggerTopic.topicArn });


    // Tagging
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali');
  }
}
