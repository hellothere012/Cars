// backend/lambdas/shared/dbClient.js
// Purpose: Centralized client for interacting with DynamoDB using AWS SDK v3.

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize AWS SDK v3 DynamoDBClient and DynamoDBDocumentClient
// The region should be configured in the Lambda environment variables.
// Provide a default for local testing if REGION is not set.
const region = process.env.REGION || 'us-east-1';
const ddbClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// The table name should be configured in the Lambda environment variables.
const TABLE_NAME = process.env.VEHICLES_TABLE_NAME;

/**
 * Inserts or updates a vehicle item in the DynamoDB table.
 * This function constructs the primary key (PK, SK) and Global Secondary Index keys (GSI1PK, GSI1SK).
 * @param {object} vehicle - The vehicle data. Expected properties include:
 * vehicleId, make, model, year, mileage, price, status, createdAt, updatedAt.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If TABLE_NAME is not set or if the DynamoDB operation fails.
 */
async function putVehicle(vehicle) {
  if (!TABLE_NAME) {
    console.error('VEHICLES_TABLE_NAME environment variable is not set.');
    throw new Error('Table name environment variable is not configured.');
  }
  if (!vehicle || !vehicle.vehicleId) {
    throw new Error('Vehicle data and vehicleId are required.');
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: `VEHICLE#${vehicle.vehicleId}`,
      SK: 'METADATA', // Using a fixed SK for the main vehicle metadata item
      vehicleId: vehicle.vehicleId,
      make: vehicle.make,
      model: vehicle.model,
      year: parseInt(vehicle.year, 10), // Ensure year is a number
      mileage: parseInt(vehicle.mileage, 10), // Ensure mileage is a number
      price: parseFloat(vehicle.price), // Ensure price is a number
      status: vehicle.status || 'AVAILABLE', // Default status
      createdAt: vehicle.createdAt || new Date().toISOString(),
      updatedAt: vehicle.updatedAt || new Date().toISOString(),
      // Construct GSI keys. Ensure consistent casing for make/model and padding for numbers.
      GSI1PK: `${String(vehicle.make || '').toUpperCase()}##${String(vehicle.model || '').toUpperCase()}`,
      GSI1SK: `${String(vehicle.year || '').padStart(4, '0')}##${String(vehicle.mileage || '0').padStart(10, '0')}`,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log(`Successfully put vehicle: ${vehicle.vehicleId}`);
  } catch (error) {
    console.error('Error putting vehicle into DynamoDB:', error);
    throw new Error('Could not create or update vehicle data.');
  }
}

/**
 * Retrieves a vehicle by its ID from the DynamoDB table.
 * @param {string} vehicleId - The ID of the vehicle to retrieve.
 * @returns {Promise<object|null>} The vehicle item if found, otherwise null.
 * @throws {Error} If TABLE_NAME is not set or if the DynamoDB operation fails.
 */
async function getVehicleById(vehicleId) {
  if (!TABLE_NAME) {
    console.error('VEHICLES_TABLE_NAME environment variable is not set.');
    throw new Error('Table name environment variable is not configured.');
  }
  if (!vehicleId) {
    throw new Error('vehicleId is required to get a vehicle.');
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `VEHICLE#${vehicleId}`,
      SK: 'METADATA',
    },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (Item) {
      console.log(`Successfully retrieved vehicle: ${vehicleId}`);
      return Item;
    } else {
      console.log(`Vehicle not found: ${vehicleId}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting vehicle by ID from DynamoDB:', error);
    throw new Error('Could not retrieve vehicle data.');
  }
}

/**
 * Scans the DynamoDB table to retrieve all vehicle items that are metadata.
 * This is a basic scan and can be inefficient for large tables.
 * For production, consider more targeted queries using GSIs or pagination.
 * The issue specifies using ScanCommand for this function.
 * @returns {Promise<Array<object>>} An array of vehicle items.
 * @throws {Error} If TABLE_NAME is not set or if the DynamoDB operation fails.
 */
async function queryVehicles() {
  if (!TABLE_NAME) {
    console.error('VEHICLES_TABLE_NAME environment variable is not set.');
    throw new Error('Table name environment variable is not configured.');
  }

  const params = {
    TableName: TABLE_NAME,
    // This FilterExpression ensures we only get the main vehicle metadata items,
    // assuming other item types might exist in the table with different SK values or PK prefixes.
    FilterExpression: "SK = :sk_value AND begins_with(PK, :pk_prefix)",
    ExpressionAttributeValues: {
      ":sk_value": "METADATA",
      ":pk_prefix": "VEHICLE#"
    }
  };

  try {
    // A loop might be needed here to handle pagination if the table is large,
    // as ScanCommand returns up to 1MB of data per call.
    // For simplicity, this example fetches the first page of results.
    const { Items } = await docClient.send(new ScanCommand(params));
    console.log(`Successfully scanned vehicles. Found ${Items ? Items.length : 0} items.`);
    return Items || [];
  } catch (error) {
    console.error('Error scanning vehicles from DynamoDB:', error);
    throw new Error('Could not query vehicle data.');
  }
}

module.exports = {
  putVehicle,
  getVehicleById,
  queryVehicles,
  // docClient, // Export if direct access to docClient is needed elsewhere
  // TABLE_NAME // Export if table name is needed directly elsewhere
};
