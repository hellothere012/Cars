// backend/lambdas/getVehicle/handler.js
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

  // 1. const { vehicleId } = event.pathParameters
  const vehicleId = event.pathParameters && event.pathParameters.vehicleId;

  // 2. if (!vehicleId) return 400 error
  if (!vehicleId) {
    console.error('Missing vehicleId in pathParameters');
    return errorResponse('Vehicle ID is required.', 400);
  }

  // Basic validation for vehicleId format (UUID) - optional but good practice
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(vehicleId)) {
      console.error('Invalid vehicleId format:', vehicleId);
      return errorResponse('Invalid Vehicle ID format.', 400);
  }

  try {
    // 3. const vehicle = await dbClient.getVehicleById(vehicleId)
    const vehicle = await dbClient.getVehicleById(vehicleId);

    // 4. if (!vehicle) return 404 error
    if (!vehicle) {
      console.log('Vehicle not found:', vehicleId);
      return errorResponse('Vehicle not found.', 404);
    }

    console.log('Vehicle retrieved successfully:', vehicleId);
    // 5. return { statusCode: 200, body: JSON.stringify(vehicle) }
    return successResponse(vehicle, 200);
  } catch (dbError) {
    console.error('Error retrieving vehicle from DynamoDB:', dbError);
    // Check if the error from dbClient is about table not found or other setup issues
    if (dbError.message.includes('VEHICLES_TABLE_NAME environment variable is not set') || dbError.message.includes('Table name environment variable is not configured')) {
        return errorResponse('Service configuration error.', 500);
    }
    return errorResponse('Failed to retrieve vehicle from database.', 500);
  }
};
