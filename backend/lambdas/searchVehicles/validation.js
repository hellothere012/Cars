// backend/lambdas/searchVehicles/validation.js
// Purpose: Provides validation logic for the searchVehicles Lambda.
// TODO: Implement validation for search criteria (e.g., make, model, year range, mileage range).

const validateSearchVehiclesInput = (queryParams) => {
  const errors = [];
  // Example:
  // if (queryParams.yearFrom && queryParams.yearTo && parseInt(queryParams.yearFrom) > parseInt(queryParams.yearTo)) {
  //   errors.push('yearFrom cannot be greater than yearTo.');
  // }
  // if (queryParams.mileage && (typeof queryParams.mileage !== 'number' || queryParams.mileage < 0)) {
  //   errors.push('Invalid mileage value.');
  // }
  // Add more validation rules for different search parameters.

  if (queryParams.someUnsupportedParameter) {
    errors.push('Unsupported search parameter: someUnsupportedParameter');
  }


  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateSearchVehiclesInput,
};
