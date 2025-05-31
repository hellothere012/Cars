// infra/cdk/stacks/OcrPipelineStack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
// import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as iam from 'aws-cdk-lib/aws-iam';
// import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
// import * as s3 from 'aws-cdk-lib/aws-s3'; // For granting Textract read access to booksheets bucket
// import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'; // For granting processResultLambda write access
// import * as path from 'path';

export interface OcrPipelineStackProps extends cdk.StackProps {
  readonly envName: string;
  readonly projectPrefix: string;
  // readonly ocrTriggerTopic?: sns.ITopic; // Input from StorageStack (SNS topic for S3 new object event)
  // readonly booksheetsBucket?: s3.IBucket; // Input from StorageStack (for Textract to read from)
  // readonly vehiclesTable?: dynamodb.ITable; // Input from DatabaseStack (for processResultLambda to write to)
}

export class OcrPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OcrPipelineStackProps) {
    super(scope, id, props);
    const { envName, projectPrefix } = props; // ocrTriggerTopic, booksheetsBucket, vehiclesTable

    console.log(`OcrPipelineStack (${envName}): TODO: Implement SNS Topic for Textract completion, SQS Queue, Textract IAM permissions, and Lambda functions (booksheetOCR/handler.js and booksheetOCR/processResult.js).`);

    // TODO: Create SNS topic for Textract to publish completion events (TextractCompletionTopic-${envName})
    // const textractCompletionTopic = new sns.Topic(this, ...);

    // TODO: Create SQS queue (TextractResultQueue-${envName}) and subscribe to textractCompletionTopic.
    // This queue will receive messages when Textract jobs are done.
    // const textractResultQueue = new sqs.Queue(this, ...);
    // textractCompletionTopic.addSubscription(new sns_subscriptions.SqsSubscription(textractResultQueue));

    // TODO: IAM Role for Textract service to allow it to publish to textractCompletionTopic.
    // const textractServiceRole = new iam.Role(this, ... { assumedBy: new iam.ServicePrincipal('textract.amazonaws.com') });
    // textractCompletionTopic.grantPublish(textractServiceRole);
    // booksheetsBucket?.grantRead(textractServiceRole); // Grant Textract role read access to the S3 bucket where book sheets are stored

    // TODO: Lambda Function: booksheetOCR/handler.js (S3 event trigger from StorageStack's ocrTriggerTopic, or directly if preferred)
    // This Lambda will be triggered by new book sheets in S3 and will start the Textract analysis.
    // It needs permissions to call Textract (e.g., textract:StartDocumentAnalysis) and pass the textractServiceRole.
    // const startOcrLambda = new lambda.Function(this, `${projectPrefix}${envName}StartOcrLambda`, {
    //   code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/lambdas/booksheetOCR')), // Assuming handler.js is main
    //   handler: 'handler.handler', // Or specific entry point for starting OCR
    //   environment: {
    //     TEXTRACT_SNS_TOPIC_ARN: textractCompletionTopic.topicArn,
    //     TEXTRACT_ROLE_ARN: textractServiceRole.roleArn,
    //   },
    // });
    // startOcrLambda.addToRolePolicy(new iam.PolicyStatement({
    //   actions: ['textract:StartDocumentAnalysis'],
    //   resources: ['*'], // Textract actions are typically not resource-specific in the same way as S3/DynamoDB
    // }));
    // startOcrLambda.addToRolePolicy(new iam.PolicyStatement({ // Allow passing the role to Textract
    //   actions: ['iam:PassRole'],
    //   resources: [textractServiceRole.roleArn],
    // }));
    // ocrTriggerTopic?.addSubscription(new sns_subscriptions.LambdaSubscription(startOcrLambda));


    // TODO: Lambda Function: booksheetOCR/processResult.js (triggered by textractResultQueue)
    // This Lambda will process the results from Textract.
    // It needs permissions for textract:GetDocumentAnalysis and to write to DynamoDB (vehiclesTable).
    // const processOcrResultLambda = new lambda.Function(this, `${projectPrefix}${envName}ProcessOcrResultLambda`, {
    //   code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/lambdas/booksheetOCR')),
    //   handler: 'processResult.handler', // Assuming processResult.js has a handler function
    //   environment: {
    //     VEHICLES_TABLE_NAME: vehiclesTable?.tableName || '',
    //   },
    // });
    // processOcrResultLambda.addEventSource(new SqsEventSource(textractResultQueue, { batchSize: 1 /* or higher */ }));
    // processOcrResultLambda.addToRolePolicy(new iam.PolicyStatement({
    //   actions: ['textract:GetDocumentAnalysis'],
    //   resources: ['*'],
    // }));
    // vehiclesTable?.grantWriteData(processOcrResultLambda);


    // Tagging
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali');
  }
}
