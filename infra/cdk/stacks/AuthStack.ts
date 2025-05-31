import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface AuthStackProps extends cdk.StackProps {
  readonly envName: string; // e.g., 'staging' or 'production'
  readonly projectPrefix: string; // e.g., 'CarInv'
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const { envName, projectPrefix } = props;

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, `${projectPrefix}${envName}UserPool`, {
      userPoolName: `${projectPrefix}-${envName}-UserPool`,
      selfSignUpEnabled: true, // Allow users to sign up themselves
      signInAliases: { email: true, username: true }, // Allow sign-in with verified email or username
      autoVerify: { email: true }, // Automatically verify email addresses; phone can be added if needed
      standardAttributes: {
        email: {
          required: true,
          mutable: false, // Email cannot be changed after sign-up to maintain it as a primary identifier
        },
        // Add other attributes like given_name, family_name if needed
        // profilePicture: { required: false, mutable: true },
        // preferredUsername: { required: false, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false, // As per problem description, only upper, lower, digit needed. Set to true for more security.
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, // Configure appropriately for your needs
      removalPolicy: envName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // DESTROY for non-prod, RETAIN for prod
    });

    // Determine callback and logout URLs based on environment
    const callbackUrls = [
      envName === 'prod' ? 'https://placeholderdomain.com' : `https://develop.placeholderdomain.com`,
      'http://localhost:3000', // For local development
    ];
    const logoutUrls = [
      envName === 'prod' ? 'https://placeholderdomain.com' : `https://develop.placeholderdomain.com`,
      'http://localhost:3000', // For local development
    ];

    // Create Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, `${projectPrefix}${envName}AppClient`, {
      userPoolClientName: `${projectPrefix}-${envName}-AppClient`,
      userPool: this.userPool,
      generateSecret: false, // No client secret for public clients like web/mobile apps
      authFlows: {
        userSrp: true, // Secure Remote Password protocol, recommended for web/mobile
        adminUserPassword: true, // Allows admin to use username/password, useful for backend operations or testing
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true, // Standard OAuth2 flow
          implicitCodeGrant: true,      // Often used by Amplify for token retrieval directly
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN // If client needs to perform admin operations like listUsers
        ],
        callbackUrls: callbackUrls,
        logoutUrls: logoutUrls,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO, // Allow sign-in with User Pool users
        // Add other providers like GOOGLE, FACEBOOK, AMAZON if needed later
      ],
      // Prevent token revocation for refresh token to align with Amplify's default behavior
      // Revoke specific refresh tokens if needed through API calls or Cognito console
      preventUserExistenceErrors: true, // Recommended to prevent user enumeration attacks
    });

    // Outputs for referencing these resources in other stacks or outputs
    new cdk.CfnOutput(this, `${projectPrefix}${envName}UserPoolIdOutput`, {
      value: this.userPool.userPoolId,
      exportName: `${projectPrefix}-${envName}-UserPoolId`, // Export name must be unique within the account/region
      description: 'ID of the Cognito User Pool',
    });

    new cdk.CfnOutput(this, `${projectPrefix}${envName}UserPoolClientIdOutput`, {
      value: this.userPoolClient.userPoolClientId,
      exportName: `${projectPrefix}-${envName}-UserPoolClientId`, // Export name must be unique
      description: 'ID of the Cognito User Pool Client',
    });

    // Tagging resources for organization and cost tracking
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali'); // As specified
  }
}
