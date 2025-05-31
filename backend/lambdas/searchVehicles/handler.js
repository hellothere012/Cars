// backend/lambdas/searchVehicles/handler.js
const dbClient = require('../../shared/dbClient');
// const { successResponse, errorResponse } = require('../../shared/response'); // Assuming response.js stubs

// Basic response helpers (until response.js is implemented)
const successResponse = (body, statusCode = 200) => ({
    statusCode,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, // Add CORS header
});

const errorResponse = (message, statusCode = 400) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, // Add CORS header
});

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  // No specific path parameters or body expected for a simple scan/query all.
  // Query parameters could be added here for filtering if functionality is extended.

  try {
    // 1. const vehicles = await dbClient.queryVehicles()
    // This currently maps to a Scan operation in dbClient.js as per its implementation.
    const vehicles = await dbClient.queryVehicles();

    console.log(`Found ${vehicles.length} vehicles.`);
    // 2. return { statusCode: 200, body: JSON.stringify(vehicles) }
    return successResponse(vehicles, 200);
  } catch (dbError) {
    console.error('Error searching vehicles in DynamoDB:', dbError);
    // Check if the error from dbClient is about table not found or other setup issues
    if (dbError.message.includes('VEHICLES_TABLE_NAME environment variable is not set') || dbError.message.includes('Table name environment variable is not configured')) {
        return errorResponse('Service configuration error.', 500);
    }
    return errorResponse('Failed to search vehicles in database.', 500);
  }
};
