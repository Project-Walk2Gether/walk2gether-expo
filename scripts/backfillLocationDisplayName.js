/**
 * Backfill Script - Add displayName field to all user location records
 * 
 * This script will:
 * 1. Query all user records in Firestore
 * 2. For each user with a location but no displayName, generate one
 * 3. Update the records with the new field
 */

const firebase = require('@react-native-firebase/app');
const firestore = require('@react-native-firebase/firestore');

// Import the extractDisplayName utility function
const { extractDisplayName } = require('../utils/locationUtils');

// Helper function to determine if a string appears to be an address
const looksLikeAddress = (str) => {
  if (!str) return false;
  // Check for common address components like numbers, street indicators, etc.
  return /\d+/.test(str) || 
         /\b(st|ave|rd|blvd|dr|ln|ct|way|pl|street|avenue|road|boulevard|drive|lane)\b/i.test(str);
};

/**
 * Generate a displayName from a location object that doesn't have one
 * @param {Object} location - The location object 
 */
const generateDisplayName = (location) => {
  // Case 1: It's a string (older format)
  if (typeof location === 'string') {
    // If it looks like an address, return "Unknown Location"
    return looksLikeAddress(location) ? "Unknown Location" : location;
  }
  
  // Case 2: It's an object but with no address components to extract from
  if (!location.addressComponents) {
    // If name looks like an address, use it as is
    if (looksLikeAddress(location.name)) {
      // Try to extract some parts from the name using regex
      const cityMatch = location.name.match(/([A-Za-z\s]+),/);
      if (cityMatch && cityMatch[1]) {
        return cityMatch[1].trim();
      }
      return location.name;
    }
    return location.name || "Unknown Location";
  }
  
  // Case 3: We have address components, use our extraction function
  return extractDisplayName(
    location.addressComponents || [], 
    location.formattedAddress || location.name || ""
  );
};

/**
 * Backfill displayName field for all user records
 */
const backfillDisplayNames = async () => {
  const db = firestore();
  
  try {
    console.log('Starting backfill of location displayName field...');
    
    // Get all user documents
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} user records`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    // Process each user document
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Skip if user doesn't have a location
      if (!userData.location) continue;
      
      // Skip if location already has a displayName
      if (userData.location.displayName) continue;
      
      // Generate a displayName for the location
      const displayName = generateDisplayName(userData.location);
      console.log(`User ${doc.id}: Generated displayName "${displayName}" from location:`, 
        typeof userData.location === 'string' ? userData.location : JSON.stringify(userData.location));
      
      // Create updated location object
      let updatedLocation;
      if (typeof userData.location === 'string') {
        // Convert string location to object with displayName
        updatedLocation = {
          name: userData.location,
          displayName: displayName,
          placeId: "",
          latitude: 0,
          longitude: 0,
        };
      } else {
        // Add displayName to existing location object
        updatedLocation = {
          ...userData.location,
          displayName: displayName
        };
      }
      
      // Update document in batch
      batch.update(doc.ref, {
        location: updatedLocation
      });
      
      updateCount++;
      
      // Firestore has a limit of 500 operations per batch
      if (updateCount % 400 === 0) {
        console.log(`Committing batch of ${updateCount} updates...`);
        await batch.commit();
        batch = db.batch(); // Create new batch
      }
    }
    
    // Commit any remaining updates
    if (updateCount % 400 !== 0) {
      console.log(`Committing final batch of ${updateCount % 400} updates...`);
      await batch.commit();
    }
    
    console.log(`Backfill complete! Updated ${updateCount} user records.`);
    
  } catch (error) {
    console.error('Error during backfill:', error);
  }
};

// Execute the backfill
backfillDisplayNames().then(() => {
  console.log('Script execution complete');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
