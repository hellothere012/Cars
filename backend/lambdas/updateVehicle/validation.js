// backend/lambdas/updateVehicle/validation.js
// Purpose: Provides validation logic for the updateVehicle Lambda.
// TODO: Implement validation for vehicle update data (e.g., ensure no critical fields like VIN are changed, validate data types).

const validateUpdateVehicleInput = (data) => {
  const errors = [];
  if (data.vin) {
    // Potentially disallow VIN changes or add specific logic if allowed
    // errors.push('VIN cannot be changed during an update. For corrections, consider a different process.');
  }
  if (data.hasOwnProperty('year') && (typeof data.year !== 'number' || data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
    errors.push('Invalid year.');
  }
  // Add more validation rules for other updatable fields.
  // Ensure that only allowed fields are present in the `data` object.

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateUpdateVehicleInput,
};
