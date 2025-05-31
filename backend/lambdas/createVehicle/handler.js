// backend/lambdas/createVehicle/handler.js
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../../shared/dbClient');
const vehicleSchema = require('./validation');
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

  let requestBody;
  try {
    // 1. Parse event.body
    requestBody = JSON.parse(event.body || '{}');
  } catch (parseError) {
    console.error('Malformed JSON:', parseError);
    return errorResponse('Invalid request body: Malformed JSON.', 400);
  }

  // 2. Destructure { make, model, year, mileage, price }
  const { make, model, year, mileage, price } = requestBody;

  // 3. Validate input via validation.js schema
  const { error, value } = vehicleSchema.validate({ make, model, year, mileage, price }, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    console.error('Validation errors:', errorMessages);
    return errorResponse(`Validation failed: ${errorMessages}`, 400);
  }

  // 4. Generate vehicleId
  const vehicleId = uuidv4();
  // 5. const now = new Date().toISOString()
  const now = new Date().toISOString();

  const vehicleData = {
    vehicleId,
    make: value.make,
    model: value.model,
    year: Number(value.year),
    mileage: Number(value.mileage),
    price: Number(value.price),
    status: 'ACTIVE', // Default status
    createdAt: now,
    updatedAt: now,
  };

  try {
    // 6. await dbClient.putVehicle(...)
    await dbClient.putVehicle(vehicleData);
    console.log('Vehicle created successfully:', vehicleId);
    // 7. Return { statusCode: 201, body: JSON.stringify({ vehicleId }) }
    return successResponse({ vehicleId, message: 'Vehicle created successfully.' }, 201);
  } catch (dbError) {
    console.error('Error saving vehicle to DynamoDB:', dbError);
    return errorResponse('Failed to create vehicle in database.', 500);
  }
};
