/**
 * Dictionary of Sri Lankan tourist locations and their coordinates.
 * Used to map itinerary location names to map markers.
 */
export const SRI_LANKA_LOCATIONS = {
    // Major Cities
    "Colombo": { lat: 6.9271, lng: 79.8612 },
    "Kandy": { lat: 7.2906, lng: 80.6337 },
    "Galle": { lat: 6.0535, lng: 80.2210 },
    "Jaffna": { lat: 9.6615, lng: 80.0255 },
    "Negombo": { lat: 7.2081, lng: 79.8373 },
    "Trincomalee": { lat: 8.5874, lng: 81.2152 },
    "Batticaloa": { lat: 7.7310, lng: 81.6747 },
    "Matara": { lat: 5.9549, lng: 80.5550 },
    "Kurunegala": { lat: 7.4818, lng: 80.3609 },
    "Ratnapura": { lat: 6.6828, lng: 80.3992 },

    // Cultural Triangle
    "Sigiriya": { lat: 7.9570, lng: 80.7603 },
    "Dambulla": { lat: 7.8742, lng: 80.6511 },
    "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
    "Polonnaruwa": { lat: 7.9403, lng: 81.0188 },
    "Mihintale": { lat: 8.3500, lng: 80.5000 },
    "Yapahuwa": { lat: 7.8286, lng: 80.3129 },

    // Hill Country
    "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
    "Ella": { lat: 6.8667, lng: 81.0467 },
    "Haputale": { lat: 6.7694, lng: 80.9442 },
    "Badulla": { lat: 6.9897, lng: 81.0557 },
    "Adam's Peak": { lat: 6.8096, lng: 80.4994 },
    "Horton Plains": { lat: 6.8044, lng: 80.8037 },
    "Knuckles": { lat: 7.4244, lng: 80.7183 },

    // Wildlife Parks
    "Yala": { lat: 6.3674, lng: 81.5173 },
    "Udawalawe": { lat: 6.4740, lng: 80.8800 },
    "Wilpattu": { lat: 8.3833, lng: 80.0667 },
    "Minneriya": { lat: 8.0305, lng: 80.8406 },
    "Sinharaja": { lat: 6.3867, lng: 80.4700 },
    "Bundala": { lat: 6.1667, lng: 81.2167 },

    // Coastal / Beaches
    "Bentota": { lat: 6.4168, lng: 79.9959 },
    "Hikkaduwa": { lat: 6.1384, lng: 80.1017 },
    "Mirissa": { lat: 5.9482, lng: 80.4716 },
    "Unawatuna": { lat: 6.0174, lng: 80.2489 },
    "Tangalle": { lat: 6.0244, lng: 80.7941 },
    "Arugam Bay": { lat: 6.8408, lng: 81.8317 },
    "Pasikudah": { lat: 7.9238, lng: 81.5606 },
    "Nilaveli": { lat: 8.6833, lng: 81.1833 },
    "Kalpitiya": { lat: 8.2295, lng: 79.7596 },
    "Weligama": { lat: 5.9728, lng: 80.4285 },

    // Others
    "Pinnawala": { lat: 7.2952, lng: 80.3793 },
    "Kitulgala": { lat: 6.9934, lng: 80.4230 },
    "Tissamaharama": { lat: 6.2800, lng: 81.2875 },
    "Habarana": { lat: 8.0333, lng: 80.7500 },
    "Arugambe": { lat: 6.8408, lng: 81.8317 }, // Alias for Arugam Bay
    "Pasikudah": { lat: 7.9238, lng: 81.5606 } // Ensure consistent casing if needed
};

/**
 * Helper to fuzzy match a location name to coordinates
 */
export const getCoordinates = (locationName) => {
    if (!locationName) return null;

    // Direct match
    if (SRI_LANKA_LOCATIONS[locationName]) {
        return SRI_LANKA_LOCATIONS[locationName];
    }

    // Case-insensitive match
    const lowerName = locationName.toLowerCase();
    const match = Object.keys(SRI_LANKA_LOCATIONS).find(
        key => key.toLowerCase() === lowerName
    );

    if (match) return SRI_LANKA_LOCATIONS[match];

    // Partial match (e.g. "Yala National Park" -> "Yala")
    const partialMatch = Object.keys(SRI_LANKA_LOCATIONS).find(
        key => lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)
    );

    if (partialMatch) return SRI_LANKA_LOCATIONS[partialMatch];

    // Default fallback (center of Sri Lanka-ish) if really unknown
    console.warn(`Location coordinates not found for: ${locationName}`);
    return { lat: 7.8731, lng: 80.7718 };
};
