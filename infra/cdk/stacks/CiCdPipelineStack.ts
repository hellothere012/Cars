// Purpose: Defines the CodePipeline for backend CI/CD.
// (Working Code to be implemented in Phase 2)

import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

interface CiCdPipelineStackProps extends cdk.StackProps {
  // repositoryName: string; // Name of the CodeCommit repository (or use GitHub source)
  // branchName?: string;    // Default 'main' or 'master'
  // envName: string; // To name resources, e.g., 'staging', 'prod'
}

export class CiCdPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: CiCdPipelineStackProps) {
    super(scope, id, props);

    const envName = this.node.tryGetContext('env') || 'dev';
    const branchName = props.branchName || 'main';

    // --- Source Stage (CodeCommit example) ---
    // TODO: Replace with GitHubSourceAction if using GitHub
    // const repository = codecommit.Repository.fromRepositoryName(this, 'AppRepository', props.repositoryName);
    const sourceOutput = new codepipeline.Artifact(`SourceOutput-${envName}`);
    // const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
    //   actionName: 'CodeCommit_Source',
    //   repository,
    //   branch: branchName,
    //   output: sourceOutput,
    // });

    // --- GitHub Source Action Example (uncomment and configure if using GitHub) ---
    const githubOwner = 'YOUR_GITHUB_OWNER'; // Replace with your GitHub username or organization
    const githubRepo = 'YOUR_GITHUB_REPO';   // Replace with your GitHub repository name
    const githubTokenSecretArn = 'arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:GITHUB_TOKEN_SECRET_NAME-XXXXXX'; // Replace

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
        actionName: `GitHub_Source-${envName}`,
        owner: githubOwner,
        repo: githubRepo,
        branch: branchName,
        oauthToken: cdk.SecretValue.secretsManager(githubTokenSecretArn), // Or cdk.SecretValue.unsafePlainText('YOUR_TOKEN') for testing
        output: sourceOutput,
        trigger: codepipeline_actions.GitHubTrigger.WEBHOOK, // Or POLL or NONE
    });


    // --- Build Stage (CodeBuild) ---
    // This project would typically build and test the backend Lambdas and CDK code.
    const buildProject = new codebuild.PipelineProject(this, `BuildProject-${envName}`, {
      projectName: `CarInventory-Backend-Build-${envName}`,
      // buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'), // Create a buildspec.yml in your repo
      buildSpec: codebuild.BuildSpec.fromObject({ // Or define inline
        version: '0.2',
        phases: {
          install: {
            commands: [
              'echo Installing dependencies...',
              // 'cd backend && npm ci', // Example for backend
              // 'cd ../infra/cdk && npm ci', // Example for CDK
            ],
          },
          build: {
            commands: [
              'echo Running tests...',
              // 'cd backend && npm test',
              'echo Synthesizing CDK templates...',
              // 'cd ../infra/cdk && npm run build && npx cdk synth',
            ],
          },
        },
        artifacts: {
          // 'base-directory': 'infra/cdk/cdk.out', // Output CDK templates
          // files: ['*.template.json'],
          'files': ['**/*'], // Adjust as needed
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0, // Or your preferred image
      },
    });

    const buildOutput = new codepipeline.Artifact(`BuildOutput-${envName}`);
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: `CodeBuild_Build-${envName}`,
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // --- Deploy Stage (CDK Deploy) ---
    // This stage deploys the CDK stacks.
    // It needs permissions to manage CloudFormation stacks and related resources.
    const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: `CDK_Deploy-${envName}`,
      templatePath: buildOutput.atPath(`MyCdkStack-${envName}.template.json`), // Adjust to your stack template name
      stackName: `MyCdkStack-${envName}`, // Name of the stack to deploy/update
      adminPermissions: true, // WARNING: Grants full CloudFormation permissions. Scope down in production.
      // deploymentRole: new iam.Role(...), // More secure: define a specific deployment role
      // parameterOverrides: { // If your CDK stack takes parameters
      //   'EnvName': envName,
      // },
      // extraInputs: [buildOutput], // If other artifacts are needed
    });


    // --- Pipeline Definition ---
    new codepipeline.Pipeline(this, `BackendPipeline-${envName}`, {
      pipelineName: `CarInventory-Backend-${envName}`,
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        // { // TODO: Add a manual approval stage for production deployments
        //   stageName: 'ApproveDeploy',
        //   actions: [new codepipeline_actions.ManualApprovalAction({ actionName: 'Approve' })],
        // },
        {
          stageName: 'Deploy',
          actions: [deployAction], // This deploys one stack. Add more actions for multiple stacks.
        },
      ],
      // artifactBucket: new s3.Bucket(...), // Optionally define a custom artifact bucket
    });

    new cdk.CfnOutput(this, `PipelineNameOutput-${envName}`, {
      value: `CarInventory-Backend-${envName}`,
    });

    console.log('TODO: Finalize CiCdPipelineStack (source action, buildspec, deployment roles, multi-stack deployment).');
    console.log('Note: Frontend CI/CD is often handled by Amplify Console, AWS Amplify CLI, or a separate pipeline.');
  }
}
