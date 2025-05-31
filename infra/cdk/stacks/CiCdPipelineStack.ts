import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam'; // Though direct use might be minimal if using adminPermissions
import { CfnCapabilities } from 'aws-cdk-lib'; // For CloudFormation capabilities

export interface CiCdPipelineStackProps extends cdk.StackProps {
  readonly envName: string; // e.g., 'staging', 'production'
  readonly projectPrefix: string; // e.g., 'CarInv'
  readonly githubOwner: string; // Placeholder: 'YOUR_GITHUB_OWNER'
  readonly githubRepo: string; // Placeholder: 'car-inventory-app'
  readonly githubConnectionArn: string; // Placeholder: 'arn:aws:codestar-connections:REGION:ACCOUNT_ID:connection/CONNECTION_ID'
}

export class CiCdPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CiCdPipelineStackProps) {
    super(scope, id, props);

    const { envName, projectPrefix, githubOwner, githubRepo, githubConnectionArn } = props;

    // --- Source Stage ---
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const sourceAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub_Source',
      owner: githubOwner,
      repo: githubRepo,
      branch: envName === 'prod' ? 'main' : 'develop', // 'prod' for main, 'develop' for staging/dev
      connectionArn: githubConnectionArn,
      output: sourceOutput,
      // triggerOnPush: true, // Default is true
    });

    // --- Build Stage ---
    const buildOutput = new codepipeline.Artifact('BuildOutput');
    const buildProject = new codebuild.PipelineProject(this, `${projectPrefix}${envName}BuildProject`, {
      projectName: `${projectPrefix}-${envName}-BackendBuild`,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, // Use a recent standard image
        privileged: true, // Needed for Docker builds if any, and sometimes for other operations
      },
      environmentVariables: {
        ENV_NAME: { value: envName },
        PROJECT_PREFIX: { value: projectPrefix },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '18', // Specify Node.js version for CodeBuild environment
            },
            commands: [
              'npm install -g aws-cdk', // Install AWS CDK globally in the build environment
              'echo "Installing dependencies for CDK project..."',
              'cd infra/cdk && npm ci && cd ../..',
              'echo "Installing dependencies for createVehicle Lambda..."',
              // Only run npm ci if package.json exists
              'if [ -f backend/lambdas/createVehicle/package.json ]; then cd backend/lambdas/createVehicle && npm ci && cd ../../..; fi',
              'echo "Installing dependencies for getVehicle Lambda..."',
              'if [ -f backend/lambdas/getVehicle/package.json ]; then cd backend/lambdas/getVehicle && npm ci && cd ../../..; fi',
              'echo "Installing dependencies for searchVehicles Lambda..."',
              'if [ -f backend/lambdas/searchVehicles/package.json ]; then cd backend/lambdas/searchVehicles && npm ci && cd ../../..; fi',
              // TODO: Add similar install commands for other Lambdas if they have package.json
            ],
          },
          pre_build: {
            commands: [
              'echo "Running lint and tests (TODO: Define these scripts in relevant package.json files)"',
              // Example: 'npm run lint --prefix backend/lambdas/createVehicle'
              // Example: 'npm run test --prefix backend/lambdas/createVehicle'
              // Example: 'npm run lint --prefix infra/cdk'
              // Example: 'npm run test --prefix infra/cdk'
              // For now, these are placeholders. Actual test/lint commands should be added.
            ],
          },
          build: {
            commands: [
              `echo "Starting CDK synth for environment ${envName}"`,
              // Ensure app.ts can correctly resolve paths when run from the root of the checkout
              // The output directory 'dist' will be relative to the root of the repo.
              `cdk synth --app "npx ts-node --prefer-ts-exts infra/cdk/bin/app.ts" --context env=${envName} --context projectPrefix=${projectPrefix} -o dist`,
            ],
          },
        },
        artifacts: {
          // 'base-directory': 'dist', // This should be relative to the root of the project where cdk synth -o dist runs
          'files': [
            `${projectPrefix}${envName}AuthStack.template.json`,
            `${projectPrefix}${envName}DatabaseStack.template.json`,
            `${projectPrefix}${envName}ComputeStack.template.json`,
            // TODO: Add StorageStack.template.json and OcrPipelineStack.template.json when they are created
            // TODO: Add MonitoringStack.template.json when created
            '*.template.json' // Catch-all for any other templates, ensure specific ones are listed for clarity
          ],
          'secondary-artifacts': { // If you need to output other artifacts, like Lambda code if not directly packaged by CDK
                SourceOutput: {
                    'base-directory': '.',
                    files: ['**/*'] // Example: outputting the entire source for some reason
                }
          }
        },
      }),
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CDK_Build_Synth',
      project: buildProject,
      input: sourceOutput, // Takes the source code from the previous stage
      outputs: [buildOutput], // Produces the CDK templates (and potentially other artifacts)
    });

    // --- Deploy Stage ---
    // Deploying multiple stacks. Order might matter based on dependencies (e.g., Auth -> DB -> Compute).
    const deployActions = [];

    // AuthStack Deployment
    deployActions.push(new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy_AuthStack',
      stackName: `${projectPrefix}-${envName}-AuthStack`,
      templatePath: buildOutput.atPath(`${projectPrefix}${envName}AuthStack.template.json`),
      adminPermissions: true, // WARNING: Grants full CloudFormation permissions. Scope down in production.
      capabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND], // Common capabilities
      runOrder: 1,
    }));

    // DatabaseStack Deployment
    deployActions.push(new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy_DatabaseStack',
      stackName: `${projectPrefix}-${envName}-DatabaseStack`,
      templatePath: buildOutput.atPath(`${projectPrefix}${envName}DatabaseStack.template.json`),
      adminPermissions: true,
      capabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND],
      runOrder: 2, // Ensure this runs after AuthStack if there are dependencies (usually not direct for these two)
    }));

    // ComputeStack Deployment (depends on AuthStack and DatabaseStack outputs typically passed via props)
    deployActions.push(new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy_ComputeStack',
      stackName: `${projectPrefix}-${envName}-ComputeStack`,
      templatePath: buildOutput.atPath(`${projectPrefix}${envName}ComputeStack.template.json`),
      adminPermissions: true,
      capabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND],
      runOrder: 3, // Ensure this runs after Auth and Database stacks
      // parameterOverrides: { // If your stack needs parameters from other stacks' outputs
      //   AuthStackUserPoolId: authStack.userPoolId, // This needs to be handled via SSM or by CDK inter-stack references
      // },
    }));

    // TODO: Add deploy actions for StorageStack, OcrPipelineStack, MonitoringStack with appropriate runOrder

    // --- Pipeline Definition ---
    new codepipeline.Pipeline(this, `${projectPrefix}${envName}BackendPipeline`, {
      pipelineName: `${projectPrefix}-${envName}-BackendPipeline`,
      crossAccountKeys: false, // Default, set to true if deploying to a different account
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Deploy_Core_Infrastructure', // Deploy critical stacks first
          actions: deployActions, // Contains Auth, Database, Compute
        },
        // TODO: Add Deploy_Storage_OCR stage for StorageStack and OcrPipelineStack
        // TODO: Add Deploy_Monitoring stage for MonitoringStack
        // TODO: Add a ManualApprovalAction for 'prod' environment before deployment
        // TODO: Add SmokeTest stage placeholder (e.g., invoke a health check endpoint)
      ],
    });

    // Tagging
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali');

    // Output the pipeline name
    new cdk.CfnOutput(this, `${projectPrefix}${envName}PipelineNameOutput`, {
        value: `${projectPrefix}-${envName}-BackendPipeline`,
        description: 'Name of the Backend CI/CD Pipeline'
    });
  }
}
