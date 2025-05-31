import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam'; // Ensure IAM is imported for permissions if needed explicitly
import * as path from 'path'; // Node.js path module for joining paths

export interface ComputeStackProps extends cdk.StackProps {
  readonly envName: string;
  readonly projectPrefix: string;
  readonly userPool: cognito.IUserPool; // Input from AuthStack
  readonly vehiclesTable: dynamodb.ITable; // Input from DatabaseStack
}

export class ComputeStack extends cdk.Stack {
  public readonly api: apigw.RestApi;
  public readonly authorizer: apigw.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const { envName, projectPrefix, userPool, vehiclesTable } = props;

    // Create API Gateway REST API (from previous step)
    this.api = new apigw.RestApi(this, `${projectPrefix}${envName}Api`, {
      restApiName: `${projectPrefix}-${envName}-Api`,
      description: `API for ${projectPrefix} ${envName} environment`,
      deployOptions: {
        stageName: envName,
      },
      // TODO: Restrict allowOrigins to specific Amplify frontend domains based on envName for production.
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
      },
    });

    // Create Cognito User Pools Authorizer (from previous step)
    this.authorizer = new apigw.CognitoUserPoolsAuthorizer(this, `${projectPrefix}${envName}CognitoAuthorizer`, {
      cognitoUserPools: [userPool],
      authorizerName: `${projectPrefix}-${envName}-CognitoAuthorizer`,
      identitySource: apigw.IdentitySource.header('Authorization'),
    });

    // --- Lambda Functions Definition ---

    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 512, // Increased memory for potential larger payloads or dependencies
      timeout: cdk.Duration.seconds(30),
      environment: {
        VEHICLES_TABLE_NAME: vehiclesTable.tableName,
        REGION: this.region, // AWS region from the stack
        COGNITO_USER_POOL_ID: userPool.userPoolId, // For potential validation or direct Cognito interaction
        NODE_OPTIONS: '--enable-source-maps', // Useful for debugging if source maps are generated
      },
    };

    // Create Vehicle Lambda Function
    const createVehicleFunction = new lambda.Function(this, `${projectPrefix}${envName}CreateVehicleLambda`, {
      ...commonLambdaProps,
      functionName: `${projectPrefix}-${envName}-createVehicle`,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/lambdas/createVehicle')),
      handler: 'handler.handler', // Assumes 'handler.js' with exported 'handler' function
      description: 'Lambda function to create a new vehicle.',
    });
    vehiclesTable.grantWriteData(createVehicleFunction); // Grant PutItem, UpdateItem etc.

    // Get Vehicle Lambda Function
    const getVehicleFunction = new lambda.Function(this, `${projectPrefix}${envName}GetVehicleLambda`, {
      ...commonLambdaProps,
      functionName: `${projectPrefix}-${envName}-getVehicle`,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/lambdas/getVehicle')),
      handler: 'handler.handler',
      description: 'Lambda function to retrieve a specific vehicle by ID.',
    });
    vehiclesTable.grantReadData(getVehicleFunction); // Grant GetItem, BatchGetItem etc.

    // Search Vehicles Lambda Function
    const searchVehiclesFunction = new lambda.Function(this, `${projectPrefix}${envName}SearchVehiclesLambda`, {
      ...commonLambdaProps,
      functionName: `${projectPrefix}-${envName}-searchVehicles`,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/lambdas/searchVehicles')),
      handler: 'handler.handler',
      description: 'Lambda function to search for vehicles based on criteria.',
    });
    vehiclesTable.grantReadData(searchVehiclesFunction); // Grant Scan, Query etc.

    // --- API Gateway Integrations ---

    // Resource: /vehicles
    const vehiclesResource = this.api.root.addResource('vehicles');

    // POST /vehicles -> createVehicleFunction
    vehiclesResource.addMethod('POST', new apigw.LambdaIntegration(createVehicleFunction), {
      authorizer: this.authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // GET /vehicles -> searchVehiclesFunction
    vehiclesResource.addMethod('GET', new apigw.LambdaIntegration(searchVehiclesFunction), {
      authorizer: this.authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Resource: /vehicles/{vehicleId}
    const vehicleByIdResource = vehiclesResource.addResource('{vehicleId}'); // Path parameter

    // GET /vehicles/{vehicleId} -> getVehicleFunction
    vehicleByIdResource.addMethod('GET', new apigw.LambdaIntegration(getVehicleFunction), {
      authorizer: this.authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Tagging resources for organization and cost tracking
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali');

    // Output the API endpoint URL for easy access (already defined in previous step, ensuring it's present)
    new cdk.CfnOutput(this, `${projectPrefix}${envName}ApiUrlOutput`, {
        value: this.api.url,
        exportName: `${projectPrefix}-${envName}-ApiUrl`,
        description: 'Endpoint URL for the API Gateway'
    });

    console.log(`ComputeStack: Lambdas and API Gateway routes configured for ${envName}.`);
  }
}
