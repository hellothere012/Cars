# Car Inventory Application

## Introduction & Purpose
TODO: Describe the application, its goals, and target users.
This application aims to provide a comprehensive system for managing a car dealership's vehicle inventory. Key features include adding new vehicles, searching and filtering existing stock, managing vehicle details, and integrating with OCR for quick data entry from book sheets. The target users are dealership staff, including sales personnel and inventory managers.

## Project Structure Overview
- **/frontend**: Contains the React/Next.js frontend application.
  - **/src**: Source code for the frontend.
  - **/amplify.yml**: Build specification for AWS Amplify CI/CD.
- **/backend**: Contains AWS Lambda functions (Node.js) for the application's API.
  - **/lambdas**: Individual Lambda functions, each typically with a handler, validation, and tests.
  - **/shared**: Shared code for backend services (e.g., DB client, response utilities).
- **/infra**: Contains Infrastructure as Code (IaC) using AWS CDK (TypeScript).
  - **/cdk/bin**: CDK application entry point.
  - **/cdk/stacks**: Definitions of various AWS resource stacks (Auth, DB, API, etc.).
- **/tests**: Contains End-to-End tests.
  - **/e2e**: E2E test specifications.
- **/.github/workflows**: GitHub Actions CI workflows for frontend and backend.

## Local Development Setup

### Prerequisites
- Node.js (version specified in `.nvmrc` or >= 18.x)
- npm or yarn
- AWS CLI configured with appropriate credentials and region
- AWS CDK CLI (`npm install -g aws-cdk`)
- Docker (optional, for local Lambda testing or other containerized services)

### Initial Setup
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd car-inventory-app
    ```
2.  **Install dependencies for all parts:**
    ```bash
    # For frontend
    cd frontend && npm install && cd ..
    # For backend (assuming a root package.json or run per lambda)
    # cd backend && npm install && cd .. # Or iterate through each lambda in backend/lambdas/
    # For CDK
    cd infra/cdk && npm install && cd .. && cd ..
    ```
3.  **Setup Environment Variables:**
    *   Copy `frontend/.env.example` to `frontend/.env` and populate values.
    *   For backend Lambdas, environment variables are typically set via CDK during deployment or locally via `sam local start-api --env-vars env.json`.
4.  **Bootstrap CDK (if first time using CDK in this AWS account/region):**
    ```bash
    npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION # Replace with your AWS account and region
    ```

### Running Frontend Development Server
```bash
cd frontend
npm run dev # Or yarn dev
```
Access at `http://localhost:3000` (or as specified by your frontend framework).

### Deploying CDK Stacks
Deploy stacks individually or using a script. Use the `--context env=<environment_name>` flag (e.g., `dev`, `staging`, `prod`).
```bash
cd infra/cdk

# Example: Deploying essential stacks for a 'dev' environment
npx cdk deploy AuthStack-dev DatabaseStack-dev StorageStack-dev ComputeStack-dev --context env=dev

# To deploy all stacks (ensure correct order or handle dependencies in CDK):
# npx cdk deploy "*Stack-dev" --context env=dev
```
**Note:** The `env` context variable in `cdk.json` or passed via CLI (`--context env=your_env_name`) is used to name resources and manage configurations per environment.

## Environment Variables
Refer to `frontend/.env.example` for frontend variables.
Backend Lambda environment variables are defined within their respective CDK stack definitions (e.g., `VEHICLES_TABLE_NAME` in `ComputeStack.ts`).
Key variables to expect:
- `AWS_REGION`, `AWS_PROFILE` (for local AWS CLI/CDK usage)
- `REACT_APP_API_URL` (frontend: API Gateway endpoint)
- `REACT_APP_COGNITO_USER_POOL_ID`, `REACT_APP_COGNITO_APP_CLIENT_ID`, `REACT_APP_COGNITO_REGION` (frontend: for Amplify Auth)
- `VEHICLES_TABLE_NAME` (backend: DynamoDB table name for vehicle data)
- `USER_POOL_ID` (backend: if Lambdas need to interact with Cognito)
- `KBB_API_KEY` (backend: for `calculateKBB` lambda)

## Branch Workflow
- **develop**: Main development branch. All feature branches are merged here. Corresponds to a `dev` or `staging` environment.
- **main**: Production branch. Merges from `develop` (after stabilization) trigger production deployments.
- **Feature branches**: `feature/your-feature-name`, branched from `develop`.

### Frontend CI/CD
- Managed by AWS Amplify Console (or GitHub Actions deploying to Amplify).
- Pushes/merges to `develop` branch deploy to the `dev` (or `staging`) frontend environment.
- Pushes/merges to `main` branch deploy to the `production` frontend environment.

### Backend CI/CD
- Managed by AWS CodePipeline, defined in `infra/cdk/stacks/CiCdPipelineStack.ts`.
- Pushes/merges to `develop` trigger the pipeline to build and deploy backend resources to the `dev` (or `staging`) environment.
- Pushes/merges to `main` trigger the pipeline to build and deploy backend resources to the `production` environment (often with a manual approval step).
- GitHub Actions in `.github/workflows/` run linters and tests on push/PR for backend and CDK code before pipeline deployment.

## How to Add New Lambda or CDK Resource

### Adding a New Lambda:
1.  Create a new directory in `backend/lambdas/yourNewLambdaName/`.
2.  Add `handler.js` (or `.ts`), `validation.js` (optional), `package.json` (if it has unique dependencies).
3.  Write unit tests (e.g., `test_yourNewLambdaName.js`).
4.  In `infra/cdk/stacks/ComputeStack.ts` (or a more relevant stack):
    *   Define the new Lambda function using the `lambda.Function` construct.
    *   Grant necessary IAM permissions (e.g., to DynamoDB tables, S3 buckets).
    *   Integrate it with API Gateway by adding a new route and method.
5.  Update shared code (e.g. `backend/shared/dbClient.js`) if the new lambda requires new database interactions.

### Adding a New CDK Resource (e.g., SQS Queue, S3 Bucket):
1.  Identify the appropriate stack in `infra/cdk/stacks/` (e.g., `StorageStack.ts` for S3, `OcrPipelineStack.ts` for SQS in the OCR flow).
2.  Define the new resource using the relevant CDK construct (e.g., `new sqs.Queue(...)`).
3.  Configure its properties, permissions, and any integrations with other resources.
4.  If the resource is used by Lambdas, pass its ARN or name as an environment variable or prop to the relevant Lambda definition in `ComputeStack.ts` or other stacks.

## Testing Strategy

### Backend (Lambdas & CDK)
- **Unit Tests**: Jest is recommended. Each Lambda function should have unit tests covering its core logic, validation, and interactions with mocks of AWS services.
  - Run: `cd backend && npm test` (or per-lambda: `cd backend/lambdas/someLambda && npm test`)
- **CDK Tests**: Jest can be used to write tests for CDK stacks, asserting properties of created resources.
  - Run: `cd infra/cdk && npm test`
- **Integration Tests**: (Future) Test interactions between Lambdas and actual AWS services (e.g., API Gateway -> Lambda -> DynamoDB). Can be part of CodePipeline.

### Frontend
- **Unit/Integration Tests**: Jest and React Testing Library (or Enzyme).
  - Run: `cd frontend && npm test`
- **E2E Tests**: Placeholder in `tests/e2e/` for frameworks like Cypress or Playwright.
  - TODO: Implement E2E tests for key user flows (login, add vehicle, view list/detail).

## Troubleshooting Tips
- **IAM Permission Errors**: Check Lambda execution roles and user deployment permissions. Use IAM Policy Simulator.
- **CDK Deployment Failures**: Review CloudFormation event logs in the AWS Console for detailed error messages.
- **Missing Environment Variables**: Ensure `.env` files are correctly populated for local frontend and Lambda environment variables are set in CDK.
- **Amplify Build Failures**: Check Amplify Console build logs. Ensure `amplify.yml` is correct and dependencies are compatible.
- **CORS Issues**: Configure `defaultCorsPreflightOptions` in `ComputeStack.ts` for API Gateway.
- **API Gateway 5XX Errors**: Check Lambda logs in CloudWatch for the specific function backing the endpoint.

## Naming Conventions
- **General AWS Resources**: `CarInv-<env>-<ResourceName>` (e.g., `CarInv-dev-VehiclesTable`, `CarInv-prod-AuthStack`).
- `<env>` can be `dev`, `staging`, `prod`, or other environment identifiers.
- Lambda Functions: `MyFunctionLambda-<env>`
- S3 Buckets: `carinv-<env>-<purpose>` (e.g., `carinv-dev-assets`, `carinv-prod-booksheets`) - must be globally unique.
- Consistent casing (e.g., PascalCase for stack names, camelCase for variables).

## Security Checklist
- **HTTPS**: Enforced by API Gateway and Amplify Hosting.
- **Least Privilege IAM**: Ensure Lambdas and other services have only the permissions they need.
- **Cognito Security**: Strong password policies, MFA enabled, review advanced security features.
- **Input Validation**: All Lambda handlers must validate input payloads (see `validation.js` pattern).
- **Secrets Management**: Use AWS Secrets Manager or Parameter Store for database credentials, API keys (e.g., KBB_API_KEY). Do not hardcode secrets.
- **S3 Bucket Security**: Block public access unless explicitly required. Enable server-side encryption and versioning.
- **Dependency Scanning**: Regularly scan dependencies for vulnerabilities (e.g., `npm audit`, Snyk, GitHub Dependabot).
- **Regular Audits**: Periodically review security configurations and IAM roles.
- **XSS/CSRF**: For frontend, rely on framework protections and best practices. Sanitize user inputs.

TODO: Expand all sections with more specific details as the project evolves.Successfully created `README.md`.

This completes all the planned file and directory creation tasks for the entire project structure.
