# tests/e2e/README.md
This directory is intended for End-to-End (E2E) tests for the car-inventory-app.

## TODO:
- **Choose an E2E testing framework:**
  - Examples: Cypress, Playwright.
  - Consider factors like ease of setup, language support (TS/JS), community, and CI integration.
- **Set up the chosen framework:**
  - Install necessary dependencies.
  - Configure base URLs for different environments (local, staging, production).
  - Set up authentication handling for test users (e.g., programmatic login, pre-created test accounts).
- **Write E2E tests for key user flows:**
  - User authentication:
    - Successful signup and email confirmation (if automatable).
    - Successful login.
    - Attempted login with invalid credentials.
  - Core vehicle management:
    - Adding a new vehicle through the form.
    - Verifying the new vehicle appears in the vehicle list.
    - Viewing the details of the newly added vehicle.
  - (Future) Updating an existing vehicle's details.
  - (Future) Deleting a vehicle.
  - (Future) OCR workflow simulation if possible (e.g., uploading a test booksheet and verifying it appears in a pending state or is processed).
- **Integrate E2E tests into the CI/CD pipeline:**
  - Add a separate stage in the frontend (Amplify) or backend (CodePipeline) pipeline, or a dedicated E2E workflow.
  - Run E2E tests against a deployed staging environment.
  - Consider strategies for managing test data.
- **Documentation:**
  - Document how to run E2E tests locally.
  - Document any specific setup required for E2E tests.
