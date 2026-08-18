/**
 * US Zip Code Centroid Coordinates Database & Lookup
 * Provides coordinates for distance calculations in the 2-Tier matching engine.
 */

export interface ZipCoordinate {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export const ZIP_COORDINATES: Record<string, ZipCoordinate> = {
  // New York Metro
  '10001': { lat: 40.7505, lng: -73.9934, city: 'New York', state: 'NY' },
  '10017': { lat: 40.7527, lng: -73.9772, city: 'New York', state: 'NY' },
  '10019': { lat: 40.7654, lng: -73.9857, city: 'New York', state: 'NY' },
  '10028': { lat: 40.7766, lng: -73.9535, city: 'New York', state: 'NY' },
  '10036': { lat: 40.7562, lng: -73.9798, city: 'New York', state: 'NY' },
  '11201': { lat: 40.6931, lng: -73.9926, city: 'Brooklyn', state: 'NY' },
  '11215': { lat: 40.6672, lng: -73.9822, city: 'Brooklyn', state: 'NY' },
  '11375': { lat: 40.7208, lng: -73.8451, city: 'Forest Hills', state: 'NY' },
  '10532': { lat: 41.0998, lng: -73.8051, city: 'Hawthorne', state: 'NY' },
  '10601': { lat: 41.0339, lng: -73.7629, city: 'White Plains', state: 'NY' },
  '07030': { lat: 40.7452, lng: -74.0324, city: 'Hoboken', state: 'NJ' },
  '07302': { lat: 40.7178, lng: -74.0431, city: 'Jersey City', state: 'NJ' },

  // Los Angeles & Southern California
  '90001': { lat: 33.9731, lng: -118.2479, city: 'Los Angeles', state: 'CA' },
  '90015': { lat: 34.0410, lng: -118.2642, city: 'Los Angeles', state: 'CA' },
  '90024': { lat: 34.0637, lng: -118.4357, city: 'Los Angeles', state: 'CA' },
  '90210': { lat: 34.0901, lng: -118.4065, city: 'Beverly Hills', state: 'CA' },
  '90211': { lat: 34.0668, lng: -118.3908, city: 'Beverly Hills', state: 'CA' },
  '90401': { lat: 34.0195, lng: -118.4912, city: 'Santa Monica', state: 'CA' },
  '90404': { lat: 34.0322, lng: -118.4831, city: 'Santa Monica', state: 'CA' },
  '91101': { lat: 34.1438, lng: -118.1362, city: 'Pasadena', state: 'CA' },
  '91105': { lat: 34.1381, lng: -118.1565, city: 'Pasadena', state: 'CA' },
  '92660': { lat: 33.6139, lng: -117.8761, city: 'Newport Beach', state: 'CA' },
  '92101': { lat: 32.7157, lng: -117.1611, city: 'San Diego', state: 'CA' },

  // Chicago Metro
  '60601': { lat: 41.8858, lng: -87.6229, city: 'Chicago', state: 'IL' },
  '60606': { lat: 41.8789, lng: -87.6359, city: 'Chicago', state: 'IL' },
  '60611': { lat: 41.8951, lng: -87.6242, city: 'Chicago', state: 'IL' },
  '60614': { lat: 41.9226, lng: -87.6517, city: 'Chicago', state: 'IL' },
  '60201': { lat: 42.0638, lng: -87.6974, city: 'Evanston', state: 'IL' },
  '60523': { lat: 41.8388, lng: -87.9542, city: 'Oak Brook', state: 'IL' },

  // Texas
  '77002': { lat: 29.7568, lng: -95.3656, city: 'Houston', state: 'TX' },
  '77030': { lat: 29.7118, lng: -95.3986, city: 'Houston', state: 'TX' },
  '75201': { lat: 32.7877, lng: -96.7997, city: 'Dallas', state: 'TX' },
  '75204': { lat: 32.8021, lng: -96.7997, city: 'Dallas', state: 'TX' },
  '78701': { lat: 30.2711, lng: -97.7437, city: 'Austin', state: 'TX' },
  '78756': { lat: 30.3061, lng: -97.7423, city: 'Austin', state: 'TX' },

  // Florida
  '33139': { lat: 25.7797, lng: -80.1384, city: 'Miami Beach', state: 'FL' },
  '33140': { lat: 25.8152, lng: -80.1384, city: 'Miami Beach', state: 'FL' },
  '32801': { lat: 28.5421, lng: -81.3790, city: 'Orlando', state: 'FL' },
  '32806': { lat: 28.5284, lng: -81.3802, city: 'Orlando', state: 'FL' },

  // Pacific NW & Mountain
  '98101': { lat: 47.6101, lng: -122.3344, city: 'Seattle', state: 'WA' },
  '98104': { lat: 47.6105, lng: -122.3242, city: 'Seattle', state: 'WA' },
  '80202': { lat: 39.7541, lng: -104.9978, city: 'Denver', state: 'CO' },
  '80203': { lat: 39.7439, lng: -104.9858, city: 'Denver', state: 'CO' },
  '80206': { lat: 39.7188, lng: -104.9515, city: 'Denver', state: 'CO' },
};

/**
 * Returns coordinates for a given ZIP code.
 * Falls back to estimated regional coordinates if not in static map.
 */
export function getCoordinatesForZip(zip: string): { lat: number; lng: number } {
  const cleanZip = zip.trim().slice(0, 5);
  if (ZIP_COORDINATES[cleanZip]) {
    return { lat: ZIP_COORDINATES[cleanZip].lat, lng: ZIP_COORDINATES[cleanZip].lng };
  }

  // Fallback heuristic based on first digit of US ZIP code
  const firstDigit = cleanZip.charAt(0);
  switch (firstDigit) {
    case '0': return { lat: 42.3601, lng: -71.0589 }; // Northeast (MA/NJ/etc)
    case '1': return { lat: 40.7128, lng: -74.0060 }; // NY/PA
    case '2': return { lat: 38.9072, lng: -77.0369 }; // Mid-Atlantic (DC/MD/VA/NC/SC)
    case '3': return { lat: 33.7490, lng: -84.3880 }; // Southeast (FL/GA/TN)
    case '4': return { lat: 39.9612, lng: -82.9988 }; // Midwest (OH/IN/MI/KY)
    case '5': return { lat: 44.9778, lng: -93.2650 }; // Upper Midwest (MN/WI/IA)
    case '6': return { lat: 41.8781, lng: -87.6298 }; // Central (IL/MO/KS/NE)
    case '7': return { lat: 32.7767, lng: -96.7970 }; // South Central (TX/LA/AR/OK)
    case '8': return { lat: 39.7392, lng: -104.9903 }; // Mountain (CO/AZ/UT/NV)
    case '9': return { lat: 34.0522, lng: -118.2437 }; // West Coast (CA/WA/OR/AK/HI)
    default: return { lat: 39.8283, lng: -98.5795 }; // US Geographic Center
  }
}
