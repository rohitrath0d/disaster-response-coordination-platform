import axios from 'axios';
import dotenv from 'dotenv';
import { getCachedValue, setCacheValue } from './cacheService.js';
dotenv.config();

// geocode/ googleMap 
export const getLatLngFromLocationName = async (locationName) => {

  // Using Caching service in Gemini/ Geocode service
  const cacheKey = `maps:${locationName}`;

  // ✅ Check cache first
  const cached = await getCachedValue(cacheKey);
  if (cached) {
    console.log("⚡ Google Maps cache hit");
    return cached;
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const encodedLocation = encodeURIComponent(locationName);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;

    const { data } = await axios.get(url);

    if (
      data.status === "OK" &&
      data.results &&
      data.results[0] &&
      data.results[0].geometry
    ) {
      const { lat, lng } = data.results[0].geometry.location;

      // ✅ Cache result for 1 hour
      await setCacheValue(cacheKey, { lat, lng });

      return { lat, lng };
    } else {
      throw new Error("Unable to geocode location");
    }
  } catch (err) {
    throw new Error("Geocoding failed: " + err.message);
  }
};
