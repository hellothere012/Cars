// infra/cdk/bin/app.ts
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../stacks/AuthStack';
import { DatabaseStack } from '../stacks/DatabaseStack';
import { ComputeStack } from '../stacks/ComputeStack';
import { StorageStack } from '../stacks/StorageStack';
import { OcrPipelineStack } from '../stacks/OcrPipelineStack';
import { CiCdPipelineStack } from '../stacks/CiCdPipelineStack';
import { MonitoringStack } from '../stacks/MonitoringStack';

const app = new cdk.App();

const envName = app.node.tryGetContext('env');
const projectPrefix = app.node.tryGetContext('projectPrefix') || 'CarInv';

if (!envName) {
  throw new Error("Context variable 'env' (e.g., staging, production) is required. Pass with -c env=<value>");
}

const envSpecificIdentifier = `${projectPrefix}-${envName}`;

const awsEnv: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const authStack = new AuthStack(app, `${envSpecificIdentifier}-AuthStack`, {
  env: awsEnv, envName, projectPrefix, description: `Authentication stack for ${envSpecificIdentifier}`,
});

const databaseStack = new DatabaseStack(app, `${envSpecificIdentifier}-DatabaseStack`, {
  env: awsEnv, envName, projectPrefix, description: `Database stack for ${envSpecificIdentifier}`,
});

const computeStack = new ComputeStack(app, `${envSpecificIdentifier}-ComputeStack`, {
  env: awsEnv, envName, projectPrefix, userPool: authStack.userPool, vehiclesTable: databaseStack.vehiclesTable, description: `Compute stack for ${envSpecificIdentifier}`,
});
computeStack.addDependency(authStack);
computeStack.addDependency(databaseStack);

const storageStack = new StorageStack(app, `${envSpecificIdentifier}-StorageStack`, {
  env: awsEnv, envName, projectPrefix, description: `Storage stack for ${envSpecificIdentifier}`,
});

const ocrPipelineStack = new OcrPipelineStack(app, `${envSpecificIdentifier}-OcrPipelineStack`, {
  env: awsEnv, envName, projectPrefix, description: `OCR pipeline stack for ${envSpecificIdentifier}`,
  // booksheetsBucket: storageStack.booksheetsBucket, // TODO: Uncomment when booksheetsBucket is defined in StorageStack
  // vehiclesTable: databaseStack.vehiclesTable, // TODO: Uncomment if OCR writes to this table
});
// ocrPipelineStack.addDependency(storageStack); // TODO: Uncomment when props are passed

const monitoringStack = new MonitoringStack(app, `${envSpecificIdentifier}-MonitoringStack`, {
  env: awsEnv, envName, projectPrefix, description: `Monitoring stack for ${envSpecificIdentifier}`,
  // apiGateway: computeStack.api, // TODO: Pass actual resources
  // coreLambdas: [computeStack.createVehicleLambda], // TODO: Pass actual lambda references
  // vehiclesTable: databaseStack.vehiclesTable, // TODO: Pass actual table
});
// monitoringStack.addDependency(computeStack); // TODO: Uncomment

const ciCdProps = {
  env: awsEnv, envName, projectPrefix,
  githubOwner: app.node.tryGetContext('githubOwner') || 'YOUR_GITHUB_OWNER_CONTEXT_PLACEHOLDER',
  githubRepo: app.node.tryGetContext('githubRepo') || 'car-inventory-app',
  githubConnectionArn: app.node.tryGetContext('githubConnectionArn') || 'arn:aws:codestar-connections:REGION:ACCOUNT_ID:connection/PLACEHOLDER_CONNECTION_ID',
  description: `CI/CD pipeline for backend of ${envSpecificIdentifier}`,
};
// Instantiate CiCdPipelineStack - It was already implemented, so this line should be present.
// If it was commented out in the original stub, it should be uncommented now.
const ciCdPipelineStack = new CiCdPipelineStack(app, `${envSpecificIdentifier}-CiCdPipelineStack`, ciCdProps);
// If CiCdPipelineStack has dependencies on other stacks (e.g., if it needs to know ARNs or names for CodeBuild roles),
// those dependencies should be added here. For now, assuming it's independent or handles its roles internally.


cdk.Tags.of(app).add('Project', projectPrefix);
cdk.Tags.of(app).add('EnvironmentContext', envName);
cdk.Tags.of(app).add('Owner', 'HarrisAbbaali');

app.synth();
