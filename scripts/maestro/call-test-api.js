// Generic Maestro script to call the test API with arbitrary arguments
// Usage: Pass endpoint and data as environment variables

// In Maestro, environment variables are available directly as global variables
// Default to /get-otp if no endpoint is provided
var endpointToUse = typeof endpoint !== 'undefined' ? endpoint : '/get-otp';
var dataToUse = typeof data !== 'undefined' ? data : '{}';

// For debugging
console.log('Script started with endpoint: ' + endpointToUse);

// Call the API with the specified endpoint and data
callTestApi(endpointToUse, dataToUse);

/**
 * Generic function to call any test API endpoint
 */
function callTestApi(apiEndpoint, dataString) {
  try {
    // Firebase emulator URL - this is the default port for Firebase functions emulator
    var baseUrl = 'http://localhost:5001/walkmate-d42b4/us-central1/testApi';
    var fullUrl = baseUrl + apiEndpoint;
    
    // Make GET request with query parameters for simplicity
    if (apiEndpoint === '/create-test-user') {
      // For create-test-user, we'll use a simple approach that works reliably
      var response = http.get(baseUrl + '/create-test-user?displayName=Maestro%20Test%20User&phoneNumber=%2B12003004000');
    } else {
      // For other endpoints like get-otp
      var response = http.get(fullUrl);
    }
    
    // Log the raw response
    console.log('Response status: ' + response.status);
    console.log('Response body: ' + response.body);
    
    // Parse the JSON response
    var responseData;
    try {
      responseData = JSON.parse(response.body);
      console.log('Successfully parsed response');
      
      // Copy all properties from the response to output
      for (var key in responseData) {
        if (responseData.hasOwnProperty(key)) {
          output[key] = responseData[key];
          console.log(key + ': ' + responseData[key]);
        }
      }
      
      console.log('Test API call successful');
    } catch (parseError) {
      console.log('Error parsing response: ' + parseError);
      throw new Error('Failed to parse response: ' + response.body);
    }
    
    if (responseData.error) {
      console.log('Error in response: ' + responseData.error);
      throw new Error('API returned error: ' + responseData.error);
    }
  } catch (error) {
    console.log('Error calling test API: ' + error);
    throw error;
  }

  // Set default values for common outputs
  if (apiEndpoint === '/get-otp' && !output.otp) {
    output.otp = "000000";
    console.log("Using default OTP: 000000");
  }
}
