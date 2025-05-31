// infra/cdk/stacks/MonitoringStack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
// import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as lambda from 'aws-cdk-lib/aws-lambda'; // For specific Lambda monitoring
// import * as apigw from 'aws-cdk-lib/aws-apigateway'; // For API Gateway monitoring
// import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'; // For DynamoDB Table monitoring

export interface MonitoringStackProps extends cdk.StackProps {
  readonly envName: string;
  readonly projectPrefix: string;
  // readonly apiGateway?: apigw.IRestApi; // Pass from ComputeStack
  // readonly coreLambdas?: lambda.IFunction[]; // Pass array of key lambdas from ComputeStack
  // readonly vehiclesTable?: dynamodb.ITable; // Pass from DatabaseStack
  // readonly ocrQueue?: sqs.IQueue; // Pass from OcrPipelineStack (e.g. TextractResultQueue)
}

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);
    const { envName, projectPrefix } = props; // apiGateway, coreLambdas, vehiclesTable, ocrQueue

    console.log(`MonitoringStack (${envName}): TODO: Implement CloudWatch Alarms, Dashboards, and X-Ray configuration.`);

    // TODO: Create an SNS Topic for critical alarms.
    // const criticalAlarmTopic = new sns.Topic(this, `${projectPrefix}${envName}CriticalAlarmTopic`, {
    //   displayName: `${projectPrefix}-${envName} Critical Alarms`,
    //   topicName: `${projectPrefix}-${envName}-CriticalAlarmTopic`
    // });
    // new cdk.CfnOutput(this, `${projectPrefix}${envName}CriticalAlarmTopicArn`, { value: criticalAlarmTopic.topicArn });

    // TODO: Configure CloudWatch Alarms for API Gateway (5XX errors, high latency).
    // if (apiGateway) {
    //   new cloudwatch.Alarm(this, `${projectPrefix}${envName}ApiGateway5xxAlarm`, {
    //     metric: apiGateway.metricServerError({ period: cdk.Duration.minutes(1) }),
    //     threshold: 5, evaluationPeriods: 2, comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    //     alarmDescription: `High 5XX error rate on API Gateway ${apiGateway.restApiName}`,
    //   }).addAlarmAction(new cw_actions.SnsAction(criticalAlarmTopic));
    // }

    // TODO: Configure CloudWatch Alarms for critical Lambda functions (errors, throttles, high duration).
    // coreLambdas?.forEach(fn => {
    //   new cloudwatch.Alarm(this, `${projectPrefix}${envName}${fn.node.id}ErrorAlarm`, {
    //     metric: fn.metricErrors({ period: cdk.Duration.minutes(5) }),
    //     threshold: 5, evaluationPeriods: 1,
    //     alarmDescription: `High error rate for Lambda ${fn.functionName}`,
    //   }).addAlarmAction(new cw_actions.SnsAction(criticalAlarmTopic));
    // });

    // TODO: Configure CloudWatch Alarms for DynamoDB table (throttled requests, capacity issues if provisioned).
    // if (vehiclesTable) {
    //   // Example for throttled read requests (more relevant for provisioned capacity)
    //   new cloudwatch.Alarm(this, `${projectPrefix}${envName}TableReadThrottleAlarm`, {
    //      metric: vehiclesTable.metric('ReadThrottleEvents', { statistic: 'Sum', period: cdk.Duration.minutes(5) }),
    //      threshold: 10, evaluationPeriods: 1,
    //      alarmDescription: `DynamoDB Read Throttles on table ${vehiclesTable.tableName}`,
    //   }).addAlarmAction(new cw_actions.SnsAction(criticalAlarmTopic));
    // }

    // TODO: Configure CloudWatch Alarms for SQS Queues (e.g. AgeOfOldestMessage, ApproximateNumberOfMessagesVisible for DLQs).
    // if (ocrQueue) { /* ... create alarms for ocrQueue ... */ }


    // TODO: Create CloudWatch Dashboards to visualize key metrics.
    // const dashboard = new cloudwatch.Dashboard(this, `${projectPrefix}${envName}AppDashboard`, {
    //   dashboardName: `${projectPrefix}-${envName}-ApplicationDashboard`,
    // });
    // dashboard.addWidgets(...); // Add widgets for API Gateway, Lambdas, DynamoDB etc.

    // TODO: Ensure AWS X-Ray tracing is enabled on API Gateway stages and Lambdas (often default or set in those constructs).
    // X-Ray sampling rules can be defined here if more control is needed over default sampling.
    // Example:
    // new xray.CfnSamplingRule(this, `${projectPrefix}${envName}XRaySamplingRule`, {
    //   ruleName: `${projectPrefix}-${envName}-DefaultSampling`,
    //   samplingRule: {
    //     resourceArn: '*', serviceType: '*', httpMethod: '*', urlPath: '*',
    //     fixedRate: 0.05, // 5%
    //     reservoirSize: 1, // At least 1 request per second
    //     priority: 1000,
    //     version: 1,
    //   }
    // });


    // Tagging
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali');
  }
}
