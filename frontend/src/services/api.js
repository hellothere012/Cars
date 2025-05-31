// frontend/src/services/api.js
// TODO: import { Auth } from ‘aws-amplify’;
import { Auth } from 'aws-amplify'; // Assuming Amplify is configured

// TODO: const API_URL = process.env.REACT_APP_API_URL;
// Ensure this environment variable is set in your .env file for local development
// and configured in Amplify for deployed environments.
const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url/staging'; // Fallback for local if not set

// Helper function to get the JWT token
async function getAuthHeaders() {
  try {
    const session = await Auth.currentSession();
    const token = session.getAccessToken().getJwtToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Standard Bearer token format
    };
  } catch (error) {
    console.error('Error getting user session or token:', error);
    // Handle cases where user is not authenticated or session expired
    // Potentially redirect to login or throw an error to be caught by callers
    throw new Error('User session not found. Please log in.');
  }
}

// Auth functions (re-exporting or wrapping Amplify for consistency if desired, or can be called directly)
// async function login(username, password) { return Auth.signIn(username, password); }
// async function signup(username, password, email) { return Auth.signUp({ username, password, attributes: { email } }); }

async function createVehicle(vehicleData) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(vehicleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create vehicle and parse error response' }));
    throw new Error(errorData.message || `Failed to create vehicle. Status: ${response.status}`);
  }
  return response.json();
}

async function getVehicle(vehicleId) {
  if (!vehicleId) throw new Error('vehicleId is required for getVehicle');
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get vehicle and parse error response' }));
    throw new Error(errorData.message || `Failed to get vehicle. Status: ${response.status}`);
  }
  return response.json();
}

async function listVehicles() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to list vehicles and parse error response' }));
    throw new Error(errorData.message || `Failed to list vehicles. Status: ${response.status}`);
  }
  return response.json();
}

export {
  // login, // Expose if you want to wrap Amplify Auth calls
  // signup,
  createVehicle,
  getVehicle,
  listVehicles,
  // getAuthHeaders // Could be exported if needed elsewhere, but typically internal
};
