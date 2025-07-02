// utils/locationUtils.js
import _ from 'lodash';

export function parseLocation(locationString) {
  if (!locationString) return [];
  
  // Basic cleanup
  let parts = locationString
    .replace(/\b(county|city|town|village)\b/gi, '')
    .split(/[,;]/)
    .map(part => part.trim())
    .filter(part => part.length > 0);

  // Extract state/country if in format "City, State" or "City, Country"
  const expanded = [];
  parts.forEach(part => {
    // Handle US states abbreviations
    const usStates = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', /* ... all states ... */
      'NY': 'New York', 'CA': 'California'
    };
    
    if (usStates[part.toUpperCase()]) {
      expanded.push(usStates[part.toUpperCase()]);
    }
    expanded.push(part);
  });

  // Add common variants
  const variants = [];
  expanded.forEach(part => {
    variants.push(part);
    if (part.includes(' ')) {
      variants.push(part.replace(' ', '-'));
    }
    if (part.endsWith('s')) {
      variants.push(part.slice(0, -1)); // Singular form
    }
  });

  return _.uniq(variants); // Remove duplicates
}

export function getBroaderLocationParts(locationString) {
  const parts = parseLocation(locationString);
  if (parts.length <= 1) return parts;
  
  // Return increasingly broader locations
  // e.g., "Manhattan, New York, USA" → ["New York", "USA"]
  return parts.slice(1); 
}