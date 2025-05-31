// backend/lambdas/getVehicle/validation.js
// Purpose: Provides validation logic for the getVehicle Lambda.
// TODO: Implement validation if complex rules are needed (e.g., for query parameters).

const validateGetVehicleInput = (pathParams, queryParams) => {
  const errors = [];
  if (!pathParams || !pathParams.id) {
    errors.push('Vehicle ID path parameter is required.');
  } else if (typeof pathParams.id !== 'string' || pathParams.id.trim() === '') { // Basic check
    errors.push('Vehicle ID must be a non-empty string.');
  }

  // Example for query parameters:
  // if (queryParams && queryParams.includeDetails && typeof queryParams.includeDetails !== 'boolean') {
  //   errors.push('includeDetails query parameter must be a boolean.');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateGetVehicleInput,
};
