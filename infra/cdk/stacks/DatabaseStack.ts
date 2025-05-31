import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
// import * as rds from 'aws-cdk-lib/aws-rds'; // For Aurora, if used later
// import * as ec2 from 'aws-cdk-lib/aws-ec2'; // For VPC, if Aurora is used

export interface DatabaseStackProps extends cdk.StackProps {
  readonly envName: string; // e.g., 'staging' or 'production'
  readonly projectPrefix: string; // e.g., 'CarInv'
  // readonly vpc?: ec2.IVpc; // Pass VPC if Aurora is to be used
}

export class DatabaseStack extends cdk.Stack {
  public readonly vehiclesTable: dynamodb.Table;
  // public readonly auroraCluster?: rds.IServerlessCluster; // If Aurora is implemented

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { envName, projectPrefix } = props;

    // DynamoDB Table for Vehicles
    // This table will store vehicle information using a generic PK/SK structure for flexibility.
    this.vehiclesTable = new dynamodb.Table(this, `${projectPrefix}${envName}VehiclesTable`, {
      tableName: `${projectPrefix}-${envName}-VehiclesTable`, // Physical table name
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // Primary Key (e.g., VEHICLE#<vehicleId>)
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },    // Sort Key (e.g., METADATA#<vehicleId> or specific attribute like TIMESTAMP#<timestamp>)
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity, suitable for unpredictable workloads
      pointInTimeRecovery: true, // Enable PITR for data protection
      removalPolicy: envName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // Protect production data; destroy in non-prod
    });

    // Add Global Secondary Index (GSI1) for common search patterns
    // GSI1PK: MAKE##MODEL (e.g., TOYOTA##CAMRY)
    // GSI1SK: YEAR##MILEAGE (e.g., 2021##035000)
    // This allows querying for vehicles by make/model, and sorting/filtering by year and mileage.
    this.vehiclesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL, // Project all attributes to avoid fetching from the main table for GSI queries
      // readCapacity and writeCapacity are not specified as they are not needed for PAY_PER_REQUEST billing mode GSIs.
    });

    // TODO: Aurora option for future.
    // Placeholder for Aurora Serverless cluster if complex relational queries or joins are needed in the future.
    // This would require a VPC to be set up and passed in via props.
    /*
    if (props.vpc) { // Only if VPC is provided
        this.auroraCluster = new rds.ServerlessCluster(this, `${projectPrefix}${envName}AuroraCluster`, {
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_13_7 }), // Or MySQL
            vpc: props.vpc,
            removalPolicy: envName === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            defaultDatabaseName: `${projectPrefix}${envName}DB`,
            // Other configurations like scaling, security groups etc.
        });
    }
    */

    // Outputs for referencing these resources in other stacks or for external use
    new cdk.CfnOutput(this, `${projectPrefix}${envName}VehiclesTableNameOutput`, {
      value: this.vehiclesTable.tableName,
      exportName: `${projectPrefix}-${envName}-VehiclesTableName`, // Unique export name
      description: 'Name of the Vehicles DynamoDB table',
    });

    new cdk.CfnOutput(this, `${projectPrefix}${envName}VehiclesTableArnOutput`, {
      value: this.vehiclesTable.tableArn,
      exportName: `${projectPrefix}-${envName}-VehiclesTableArn`, // Unique export name
      description: 'ARN of the Vehicles DynamoDB table',
    });

    // Tagging resources for organization and cost tracking
    cdk.Tags.of(this).add('Project', projectPrefix);
    cdk.Tags.of(this).add('Environment', envName);
    cdk.Tags.of(this).add('Owner', 'HarrisAbbaali'); // As specified
  }
}
