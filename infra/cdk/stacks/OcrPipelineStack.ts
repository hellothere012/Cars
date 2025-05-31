// Purpose: Defines resources for the booksheet OCR pipeline (SNS, SQS, Textract permissions).
// TODO: Create SNS topic TextractCompletionTopic-<env>. (Note: This might be better created in StorageStack if S3 needs to publish to it)
// TODO: Create SQS queue TextractResultQueue-<env> subscribed to the SNS topic.
// TODO: Grant Textract permission to publish to the SNS topic. (Actually, S3 needs permission to publish to SNS, Textract needs IAM role to run)
// TODO: Create Lambda processResult with SQS event source mapping.
// TODO: Grant processResult permissions: textract:GetDocumentAnalysis, DynamoDB PutItem, SNS Publish (for errors/notifications).

import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
// import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; // Optional: for easier Lambda packaging

interface OcrPipelineStackProps extends cdk.StackProps {
  textractSnsTopic: sns.ITopic; // Input topic from StorageStack (where S3 publishes)
  // vehiclesTable: dynamodb.ITable; // Input table from DatabaseStack
  // errorNotificationTopic: sns.ITopic; // Topic for error notifications
}

export class OcrPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: OcrPipelineStackProps) {
    super(scope, id, props);

    const envName = this.node.tryGetContext('env') || 'dev';

    // SQS Queue for Textract results (subscribed to the SNS topic)
    const textractResultQueue = new sqs.Queue(this, `TextractResultQueue`, {
      queueName: `TextractResultQueue-${envName}`,
      visibilityTimeout: cdk.Duration.minutes(5), // Adjust based on expected processing time
      // deadLetterQueue: { // Recommended for production
      //   maxReceiveCount: 5,
      //   queue: new sqs.Queue(this, `TextractResultDLQ-${envName}`),
      // },
    });

    // Subscribe the SQS queue to the SNS topic (passed from StorageStack)
    props.textractSnsTopic.addSubscription(new sns.subscriptions.SqsSubscription(textractResultQueue));

    // IAM Role for Textract to be able to publish to the SNS topic (if Textract job completion directly notifies SNS)
    // Note: More commonly, Textract is given an IAM role to perform its actions, and S3 triggers a Lambda
    // that *starts* Textract. The Textract job itself might publish to an SNS topic using a role you provide it.
    // For this example, we assume S3 -> SNS (from StorageStack) -> SQS -> Lambda (this stack).
    // The lambda that *starts* the Textract job would need `textract:StartDocumentAnalysis`
    // The lambda that *processes* the result (below) needs `textract:GetDocumentAnalysis`

    // Placeholder for the Lambda function that processes OCR results from the SQS queue
    // This lambda would:
    // 1. Be triggered by messages in textractResultQueue (which contain Textract JobId)
    // 2. Call textract:GetDocumentAnalysis to get results
    // 3. Parse results
    // 4. Save to DynamoDB (pending review or directly)
    const processResultLambda = new lambda.Function(this, 'ProcessOcrResultLambda', {
      functionName: `ProcessOcrResultLambda-${envName}`,
      runtime: lambda.Runtime.NODEJS_18_X, // Or your preferred runtime
      handler: 'handler.handler', // Assuming 'handler.js' and 'handler' function in the specified path
      code: lambda.Code.fromAsset('backend/lambdas/booksheetOCR'), // Path to your booksheetOCR lambda code
      // timeout: cdk.Duration.minutes(3),
      // memorySize: 256,
      // environment: {
      //   VEHICLES_TABLE_NAME: props.vehiclesTable.tableName,
      //   ERROR_TOPIC_ARN: props.errorNotificationTopic.topicArn,
      // },
    });

    // Add SQS event source to the Lambda
    processResultLambda.addEventSource(new SqsEventSource(textractResultQueue, {
      batchSize: 1, // Process one Textract job result at a time
    }));

    // Grant necessary permissions to the processResultLambda
    // props.vehiclesTable.grantWriteData(processResultLambda); // To save to DynamoDB
    // props.errorNotificationTopic.grantPublish(processResultLambda); // To publish errors

    // Permission to get Textract results
    processResultLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['textract:GetDocumentAnalysis', 'textract:StartDocumentAnalysis'], // Start might be in another lambda
      resources: ['*'], // Scope down if possible
    }));


    new cdk.CfnOutput(this, 'TextractResultQueueNameOutput', {
      value: textractResultQueue.queueName,
    });
    new cdk.CfnOutput(this, 'ProcessOcrResultLambdaArnOutput', {
      value: processResultLambda.functionArn,
    });

    console.log('TODO: Finalize OcrPipelineStack (Lambda code path, permissions, DLQs, Textract IAM role for job execution).');
  }
}
