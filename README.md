# Car Inventory Application (car-inventory-app)

## 1. Introduction & Purpose

TODO:
- Briefly describe what the Car Inventory Application does.
- What are its main goals and objectives?
- Who is the target audience or users for this application?
- What key problems does it solve or what value does it provide?

## 2. Project Structure Overview

TODO:
- Briefly explain the top-level directory structure:
  - `frontend/`: Contains the React/Next.js frontend application.
  - `backend/`: Houses the AWS Lambda functions (Node.js) for business logic.
  - `infra/`: Includes Infrastructure as Code (IaC) using AWS CDK (TypeScript) for defining AWS resources.
  - `.github/workflows/`: CI/CD pipeline configurations for GitHub Actions.
  - `tests/`: Placeholder for End-to-End tests.
- Mention key technologies used (React, Node.js, AWS Lambda, API Gateway, DynamoDB, Cognito, CDK, Amplify, CodePipeline).

## 3. Local Development Setup

### Prerequisites
- Node.js (e.g., v18.x or later) & npm: [Link to Node.js installation]
- AWS CLI configured: [Link to AWS CLI installation and configuration guide]
  - Ensure you have an AWS profile configured with necessary permissions.
- AWS CDK Toolkit: `npm install -g aws-cdk` (or ensure it's a dev dependency in `infra/cdk/package.json`)
- Git: [Link to Git installation]
- (Optional) Docker Desktop (if running local DynamoDB or other services in containers).

### Initial Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_GITHUB_OWNER/car-inventory-app.git
    cd car-inventory-app
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm ci
    # TODO: Add command if using Yarn (yarn install --frozen-lockfile)
    cd ..
    ```
3.  **Install Backend Lambda Dependencies:**
    - Each Lambda function with dependencies has its own `package.json`.
    - Example for `createVehicle` Lambda:
    ```bash
    cd backend/lambdas/createVehicle
    npm ci
    cd ../../..
    ```
    - TODO: List other Lambdas that require `npm ci` (e.g., `getVehicle`, `searchVehicles` if they have specific deps, `calculateKBB`, `booksheetOCR` stubs).
4.  **Install CDK Project Dependencies:**
    ```bash
    cd infra/cdk
    npm ci
    cd ../..
    ```
5.  **Configure Environment Variables (Frontend):**
    - Copy `frontend/.env.example` to `frontend/.env.local`.
    - Fill in the required values in `frontend/.env.local`. These will typically come from your deployed AWS backend resources (Cognito IDs, API URL). See section "5. Environment Variables" for details.

### Running Frontend Locally
```bash
cd frontend
# TODO: Verify and update the dev script name if different from "npm run dev"
npm run dev
```
- Access the frontend at `http://localhost:3000` (or the port specified by your dev server).
- TODO: Add note about configuring `REACT_APP_API_URL` in `frontend/.env.local` to point to your deployed staging API Gateway or a local mock.

### Deploying Backend (AWS CDK) Locally/to Staging
1.  **Bootstrap CDK (if first time in an AWS account/region):**
    ```bash
    cd infra/cdk
    # Replace YOUR_AWS_ACCOUNT_ID and YOUR_AWS_REGION with your actual details
    cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/YOUR_AWS_REGION \
      -c env=staging \
      -c projectPrefix=CarInv \
      # Add other necessary context variables as defined in cdk.json or app.ts (e.g., github placeholders)
    ```
    TODO: Clarify which context variables are essential for a local/staging bootstrap and deploy. The GitHub placeholders are likely not needed for a local deploy of core stacks unless CiCdPipelineStack is included.
2.  **Synthesize CloudFormation Templates (Optional Check):**
    ```bash
    cd infra/cdk
    cdk synth -c env=staging # Add other context vars if needed
    ```
3.  **Deploy Core Stacks to Staging:**
    - It's recommended to deploy stacks individually or in logical groups first.
    ```bash
    cd infra/cdk
    # Deploy Auth stack
    cdk deploy CarInv-staging-AuthStack -c env=staging
    # Deploy Database stack
    cdk deploy CarInv-staging-DatabaseStack -c env=staging
    # Deploy Compute stack (API and Lambdas for core features)
    cdk deploy CarInv-staging-ComputeStack -c env=staging
    ```
    - TODO: Confirm stack names are correct based on `app.ts` instantiation (e.g., `CarInv-staging-AuthStack`).
    - TODO: Note that `CiCdPipelineStack` is usually not deployed manually for local dev.
    - After deployment, update `frontend/.env.local` with the outputs (Cognito IDs, API Gateway URL).

## 4. Environment Variables

### Frontend (`frontend/.env.example`)
- `REACT_APP_API_URL`: URL of the deployed API Gateway (e.g., `https://api-id.execute-api.region.amazonaws.com/staging`).
- `REACT_APP_REGION`: AWS region where backend is deployed (e.g., `us-east-1`).
- `REACT_APP_COGNITO_USER_POOL_ID`: Cognito User Pool ID.
- `REACT_APP_COGNITO_APP_CLIENT_ID`: Cognito User Pool App Client ID.
- `REACT_APP_COGNITO_IDENTITY_POOL_ID` (Optional): If using Cognito Identity Pool for unauthenticated access.
- TODO: List any other custom frontend environment variables.

### Backend (Lambda Environment Variables - set via CDK in `ComputeStack.ts`, etc.)
- `VEHICLES_TABLE_NAME`: Name of the DynamoDB table for vehicles.
- `REGION`: AWS region of the Lambda and other services.
- `COGNITO_USER_POOL_ID`: Cognito User Pool ID (can be used for token validation or other Cognito interactions within Lambdas if necessary, though API Gateway handles auth).
- `KBB_API_KEY_SECRET_ARN` (For `calculateKBB` Lambda): ARN of the Secrets Manager secret holding the KBB API key.
- `TEXTRACT_SNS_TOPIC_ARN` (For `booksheetOCR/textractService`): ARN of the SNS topic Textract publishes to.
- `TEXTRACT_ROLE_ARN` (For `booksheetOCR/textractService`): ARN of the IAM role Textract assumes for SNS access.
- TODO: List any other Lambda-specific environment variables.

### CDK Context Variables (`infra/cdk/cdk.json` or passed via CLI `-c key=value`)
- `env`: (Required) Deployment environment (e.g., `staging`, `production`, `dev`).
- `projectPrefix`: Project prefix for resource naming (default: `CarInv`).
- `githubOwner`: GitHub repository owner (for `CiCdPipelineStack`).
- `githubRepo`: GitHub repository name (for `CiCdPipelineStack`).
- `githubConnectionArn`: AWS CodeStar Connection ARN for GitHub (for `CiCdPipelineStack`).
- TODO: List any other CDK context variables.

## 5. Branch Workflow & Deployment

- **`develop` branch:**
  - Represents the staging environment.
  - Pushes to `develop` trigger:
    - **Frontend (AWS Amplify):** Automatic build, test, and deploy to the staging frontend URL (e.g., `https://develop.YOUR_AMPLIFY_APP_ID.amplifyapp.com`).
    - **Backend (AWS CodePipeline):** Automatic build, test, CDK synth, and deploy of backend stacks (Auth, Database, Compute, etc.) to the staging environment in AWS.
- **`main` branch:**
  - Represents the production environment.
  - Pushes to `main` trigger:
    - **Frontend (AWS Amplify):** Automatic build, test, and deploy to the production frontend URL (e.g., `https://YOUR_DOMAIN.com`).
    - **Backend (AWS CodePipeline):** Automatic build, test, CDK synth, and deploy of backend stacks to the production environment in AWS.
    - TODO: Mention if manual approval steps are planned for production deployment in CodePipeline.
- **Feature branches (`feature/...`):**
  - Create feature branches from `develop`.
  - Make changes, commit, and push.
  - Create Pull Requests (PRs) to merge back into `develop`.
  - PRs to `develop` or `main` should trigger CI checks (linting, tests) via GitHub Actions (`frontend-ci.yml`, `backend-ci.yml`).

## 6. How to Add New Lambda or CDK Resource

### Adding a New Lambda Function
1.  **Create Lambda Directory:**
    - In `backend/lambdas/`, create a new directory for your Lambda (e.g., `myNewFunction`).
2.  **Implement Handler:**
    - Create `handler.js` (or `.ts`) with your Lambda logic.
    - Add `validation.js` if needed for input validation (e.g., using Joi).
    - Create `package.json` if your Lambda has specific dependencies and run `npm ci` or `npm install`.
3.  **Update CDK (e.g., `ComputeStack.ts`):**
    - Define a new `lambda.Function` resource, pointing to your Lambda's code.
    - Set environment variables, memory, timeout, and IAM permissions.
    - Grant necessary permissions (e.g., `myTable.grantReadData(myNewFunction)`).
4.  **Integrate with API Gateway (if applicable):**
    - In `ComputeStack.ts`, add a new API Gateway resource/method and link it to your Lambda.
    - Secure it with the Cognito authorizer if needed.
5.  **Update Backend CI/CD:**
    - If your new Lambda has dependencies, ensure `npm ci` is run for its directory in `.github/workflows/backend-ci.yml` (CodeBuild buildspec within `CiCdPipelineStack.ts` already attempts this for all lambda folders with package.json).
    - Add tests for the new Lambda.

### Adding a New CDK Resource (e.g., SQS Queue, S3 Bucket)
1.  **Choose or Create a Stack:**
    - Add the resource to an existing relevant stack in `infra/cdk/stacks/` (e.g., `StorageStack.ts` for S3, `OcrPipelineStack.ts` for SQS in the OCR flow).
    - Or, create a new stack file if it represents a new logical component.
2.  **Define the Resource:**
    - Use CDK constructs to define the resource (e.g., `new sqs.Queue(...)`, `new s3.Bucket(...)`).
    - Configure properties, permissions, and outputs as needed.
3.  **Update `app.ts`:**
    - If you created a new stack, import and instantiate it in `infra/cdk/bin/app.ts`.
    - Pass any necessary props or outputs from other stacks.
4.  **Update CI/CD Pipeline (`CiCdPipelineStack.ts`):**
    - If you created a new stack that needs to be deployed, add a new `CloudFormationCreateUpdateStackAction` to the deploy stage in `CiCdPipelineStack.ts`.
    - Ensure its template is included in the CodeBuild artifacts.

## 7. Testing Strategy

### Unit Tests
- **Frontend (Jest & React Testing Library):**
  - TODO: Describe how to run frontend unit tests (e.g., `npm test` in `frontend/` directory).
  - TODO: Mention what should be tested (components, services, utility functions).
  - TODO: Specify location for test files (e.g., `frontend/src/**/*.test.tsx`).
- **Backend Lambdas (Jest):**
  - TODO: Describe how to run Lambda unit tests (e.g., `npm test` in individual Lambda directories or a root backend test script).
  - Test handlers, validation logic (`validation.js`), and any helper modules.
  - Mock AWS SDK calls (e.g., `dbClient.js` interactions) and external dependencies.
  - Example test files: `backend/lambdas/createVehicle/test_createVehicle.js`.
- **CDK Infrastructure (Jest):**
  - TODO: Describe how to run CDK unit tests (e.g., `npm test` in `infra/cdk/` directory).
  - Use CDK's assertions library (`aws-cdk-lib/assertions`) to test synthesized CloudFormation templates for resource properties, counts, etc.

### Integration Tests
- TODO: Describe strategy for integration tests (e.g., testing API Gateway endpoints with live Lambdas and DynamoDB in a staging environment).
- This might involve using tools like Postman, Newman, or custom scripts.

### End-to-End (E2E) Tests
- Framework: Placeholder (e.g., Cypress, Playwright) - see `tests/e2e/README.md`.
- TODO: Describe how to run E2E tests once implemented.
- E2E tests will cover full user flows through the UI against a deployed environment.

## 8. Troubleshooting Tips

- **Frontend Build/Run Issues:**
  - Check Node.js/npm versions.
  - Ensure all dependencies are installed (`npm ci` in `frontend/`).
  - Verify `.env.local` configuration, especially `REACT_APP_API_URL` and Cognito IDs.
  - Check browser console for errors.
- **Backend Deployment (CDK) Issues:**
  - Ensure AWS CLI is configured correctly with appropriate permissions.
  - Check CDK bootstrap status for the account/region.
  - Verify context variables (`-c env=...`) are passed correctly to `cdk deploy`.
  - Examine CloudFormation console for detailed error messages on stack failures.
  - `cdk diff` can show pending changes before deployment.
- **API Gateway / Lambda Errors:**
  - Check CloudWatch Logs for your Lambda functions. Enable detailed logging in handlers.
  - Test API Gateway endpoints with tools like Postman or `curl`, ensuring correct headers (Authorization for protected routes).
  - Verify IAM permissions for Lambdas (e.g., DynamoDB access, Secrets Manager access).
- **CI/CD Pipeline Failures:**
  - **Amplify (Frontend):** Check build logs in the Amplify console.
  - **CodePipeline (Backend):** Examine logs for CodeBuild stage and CloudFormation deployment events.
  - **GitHub Actions:** Review workflow run logs for linting/testing errors.
- TODO: Add more specific common errors and their solutions as the project develops.

## 9. Naming Conventions

- **AWS Resources (CDK):**
  - General Pattern: `${projectPrefix}-${envName}-${ResourceName}` (e.g., `CarInv-staging-VehiclesTable`).
  - Lambdas: `CarInv-${envName}-createVehicle`
  - API Gateway: `CarInv-${envName}-Api`
  - DynamoDB Table: `CarInv-${envName}-VehiclesTable`
  - Cognito User Pool: `CarInv-${envName}-UserPool`
  - Cognito App Client: `CarInv-${envName}-AppClient`
  - S3 Buckets: `carinv-${envName}-<purpose>-<random_suffix_if_needed_for_global_uniqueness>` (e.g., `carinv-staging-booksheets-uniqueid`)
- **Tags on AWS Resources:**
  - `Project`: `CarInv` (Set globally in `app.ts` or per stack)
  - `Environment`: `${envName}` (e.g., `staging`, `production`)
  - `Owner`: `HarrisAbbaali`
- TODO: Add any other specific naming conventions (e.g., for variables, functions, components).

## 10. Security Checklist

- **HTTPS:** Ensure API Gateway and Amplify frontend use HTTPS. (Default for these services).
- **Least Privilege IAM:**
  - Lambda execution roles should only have permissions necessary for their tasks (e.g., specific DynamoDB actions on a specific table).
  - CDK deployment roles/users should also follow least privilege.
- **Cognito Security:**
  - Strong password policy enforced (as configured in `AuthStack.ts`).
  - MFA enabled for users (TODO: Consider making this configurable or mandatory).
  - Email verification required (as configured).
- **Input Validation:**
  - Validate all inputs from users/clients on both frontend and backend (Lambda handlers using Joi schemas).
  - Protect against common web vulnerabilities (XSS, SQLi - though less relevant for NoSQL/Lambda).
- **Secrets Management:**
  - Store sensitive data like external API keys (e.g., KBB API key) in AWS Secrets Manager, not in code.
  - Access secrets securely via IAM permissions for Lambdas. (Placeholder in `calculateKBB` Lambda).
- **Dependency Management:**
  - Regularly update dependencies to patch vulnerabilities (`npm audit`).
  - Use `npm ci` for consistent installs in CI/CD.
- **Data Security (DynamoDB/S3):**
  - Enable server-side encryption for S3 buckets and DynamoDB tables (default or configurable in CDK).
  - Implement Point-in-Time Recovery (PITR) for DynamoDB (as configured in `DatabaseStack.ts`).
  - Configure S3 bucket policies and block public access settings appropriately.
- **API Gateway Authorization:**
  - All protected API routes use Cognito authorizer (as configured in `ComputeStack.ts`).
- **Logging & Monitoring:**
  - Implement sufficient logging in Lambdas for audit and debugging.
  - Set up CloudWatch Alarms for critical errors/issues (as planned in `MonitoringStack.ts`).
- TODO: Add more specific security considerations as features are built out (e.g., rate limiting on API Gateway, WAF).

---
TODO: Add sections for "Future Enhancements", "Known Issues", "Contributing Guidelines" if applicable later.
