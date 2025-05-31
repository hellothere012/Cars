// backend/lambdas/deleteVehicle/validation.js
// Purpose: Provides validation logic for the deleteVehicle Lambda (if needed).
// TODO: Implement validation if there are any pre-conditions for deletion (e.g., check for active listings).

const validateDeleteVehicleInput = (vehicleId, options = {}) => {
  const errors = [];
  if (!vehicleId) {
    errors.push('Vehicle ID is required for deletion.');
  }

  // Example: Check if there are active listings associated with the vehicle.
  // if (options.hasActiveListings) {
  //   errors.push('Cannot delete vehicle with active listings. Please remove listings first.');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateDeleteVehicleInput,
};
