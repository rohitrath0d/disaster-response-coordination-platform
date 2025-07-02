// // const axios = require('axios');
// import axios from 'axios';
// // const cheerio = require('cheerio');
// // import cheerio from 'cheerio';
// import * as cheerio from 'cheerio';
// // const { supabase } = require('../config/supabase');
// import {supabase} from '../supabase/client.js'
// // const { StatusCodes } = require('http-status-codes');
// import {StatusCodes} from "http-status-codes"


// // // Indian disaster management sources
// const SOURCES = {
//   NDMA: {
//     name: 'NDMA India',
//     url: () => `https://ndma.gov.in/latest-updates`,
//     selector: '.update-item',
//     extract: ($, el) => ({
//       title: $(el).find('h3').text().trim(),
//       link: $(el).find('a').attr('href') || 'https://ndma.gov.in/latest-updates'
//     })
//   },
//   RED_CROSS: {
//     name: 'Indian Red Cross',
//     url: () => `https://redcrossindia.org/alerts`,
//     selector: '.alert-item',
//     extract: ($, el) => ({
//       title: $(el).find('h2').text().trim(),
//       link: $(el).find('a').attr('href') || 'https://redcrossindia.org/alerts'
//     })
//   },
//   IMD: {
//     name: 'IMD',
//     url: () => `https://mausam.imd.gov.in/`,
//     selector: '.alert-card',
//     extract: ($, el) => ({
//       title: $(el).find('.alert-title').text().trim(),
//       link: $(el).find('a').attr('href') || 'https://mausam.imd.gov.in/'
//     })
//   }
// };


// // const scrapeSource = async (source) => {
// //   try {
// //     const url = source.url();
// //     const response = await axios.get(url);
// //     const $ = cheerio.load(response.data);

// //     const updates = [];
// //     $(source.selector).each((i, el) => {
// //       const update = source.extract($, el);
// //       updates.push({
// //         ...update,
// //         source: source.name
// //       });
// //     });

// //     return updates;
// //   } catch (error) {
// //     console.error(`Error scraping ${source.name}:`, error.message);
// //     return [];
// //   }
// // };


// const scrapeSource = async (source) => {
//   try {
//     const url = source.url();
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);

//     const updates = [];
//     $(source.selector).each((i, el) => {
//       const update = source.extract($, el);
//       updates.push({
//         ...update,
//         source: source.name
//       });
//     });

//     // Fallback mock
//     if (updates.length === 0) {
//       updates.push({
//         title: `⚠️ Could not scrape ${source.name}, showing fallback data.`,
//         link: source.url(),
//         source: source.name
//       });
//     }

//     return updates;
//   } catch (error) {
//     console.error(`Error scraping ${source.name}:`, error.message);
//     return [{
//       title: `❌ Error fetching ${source.name}`,
//       link: source.url(),
//       source: source.name
//     }];
//   }
// };


// const getCachedUpdates = async () => {
//   const { data, error } = await supabase
//     .from('disaster_updates_cache')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(1);

//   if (!error && data.length > 0) {
//     const cache = data[0];
//     const cacheAge = (new Date() - new Date(cache.created_at)) / (1000 * 60 * 60);

//     if (cacheAge < 6) {
//       return cache.data;
//     }
//   }
//   return null;
// };

// const cacheUpdates = async (updates) => {
//   await supabase
//     .from('disaster_updates_cache')
//     .insert([
//       {
//         disaster_id: 'official-global', // static ID
//         data: updates,
//         source_urls: Object.values(SOURCES).map(s => s.url())
//       }
//     ]);
// };

// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const cached = await getCachedUpdates();
//     if (cached) {
//       return res.status(StatusCodes.OK).json({
//         success: true,
//         data: cached,
//         cached: true
//       });
//     }

//     const scrapingPromises = Object.values(SOURCES).map(scrapeSource);
//     const results = await Promise.all(scrapingPromises);
//     const updates = results.flat().filter(update => update.title);

//     if (updates.length > 0) {
//       await cacheUpdates(updates);
//     }

//     res.status(StatusCodes.OK).json({
//       success: true,
//       data: updates
//     });

//   } catch (error) {
//     console.error('Controller error:', error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       error: 'Failed to fetch official updates',
//       details: error.message
//     });
//   }
// };


import {supabase} from "../supabase/client.js";
import { scrapeOfficialUpdates } from "../services/officialUpdateScraperService.js";
import { scrapeNDMAUpdates } from '../services/ndmaScraperService.js';
// import { getCombinedDisasterData } from '../services/combinedScrapperService.js';
// import { parseLocation, getBroaderLocationParts } from '../utils/locationUtils.js';

const CACHE_TTL = 60 * 60 * 1000 * 6; // 6 hours cache

async function getDisasterInfo(disasterId) {
  const { data, error } = await supabase
    .from('disasters')
    .select('title, location_name, tags')
    .eq('id', disasterId)
    .single();

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data; // Returns { title, location_name, tags } or null
}


// Add this function to your controller (officialUpdatesController.js)
async function cacheResults(disasterId, data) {
  const { error } = await supabase
    .from('cache')
    .upsert({
      key: `official_updates_${disasterId}`,
      value: data,
      expires_at: new Date(Date.now() + CACHE_TTL).toISOString()
    });

  if (error) console.error('Caching failed:', error);
}


export const getOfficialUpdates = async (req, res) => {
  const disasterId = req.params.id;
  
  try {
    // 1. Get disaster info first (needed for all strategies)
    const disaster = await getDisasterInfo(disasterId);
    if (!disaster) return sendFallback(res, 'Disaster not found');

    // 2. Try all data sources in parallel
    const [cachedData, liveData] = await Promise.all([
      getEnhancedCache(disasterId, disaster),
      getLiveData(disaster)
    ]);

    // 3. Determine best response
    const bestResponse = selectBestResponse(cachedData, liveData);
    
    // 4. Cache if we got better live data
    if (bestResponse.source === 'live' && bestResponse.data.length > 0) {
      await cacheResults(disasterId, bestResponse.data);
    }

    return formatResponse(bestResponse, res);
  } catch (error) {
    console.error('Controller error:', error);
    return sendFallback(res, error.message);
  }
};

// ======================
// DATA ACQUISITION TIERS
// ======================

async function getEnhancedCache(disasterId, disaster) {
  // Get both fresh and stale cache
  const [freshCache, staleCache] = await Promise.all([
    supabase.from('cache')
      .select('value,created_at')
      .eq('key', `official_updates_${disasterId}`)
      .gt('expires_at', new Date().toISOString())
      .single(),
      
    supabase.from('cache')
      .select('value,created_at')
      .eq('key', `official_updates_${disasterId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ]);

  return {
    source: 'cache',
    data: freshCache.data?.value || staleCache.data?.value || [],
    freshness: freshCache.data ? 'fresh' : staleCache.data ? 'stale' : 'none',
    disasterContext: disaster // Include disaster info for smart fallbacks
  };
}


// data using puppeeter but slow.
// async function getLiveData(disaster) {
//   try {
//     // Try both sources with error isolation
//     const [femaData, ndmaData] = await Promise.allSettled([
//       scrapeOfficialUpdates(),
//       scrapeNDMAUpdates()
//     ]);

//     // Process results
//     const successfulData = [];
    
//     if (femaData.status === 'fulfilled') {
//       successfulData.push(...femaData.value.map(d => ({ 
//         ...d, 
//         sourceSystem: 'FEMA',
//         isActive: true 
//       })));
//     } else {
//       console.error('FEMA failed:', femaData.reason);
//     }

//     if (ndmaData.status === 'fulfilled') {
//       successfulData.push(...ndmaData.value.map(d => ({
//         ...d,
//         sourceSystem: 'NDMA',
//         disasterNumber: d.url.split('/').pop() || 'NDMA-' + Date.now()
//       })));
//     } else {
//       console.error('NDMA failed:', ndmaData.reason);
//     }

//     return {
//       source: 'live',
//       data: successfulData,
//       freshness: 'live',
//       scrapedAt: new Date().toISOString()
//     };
    
//   } catch (error) {
//     console.error('Live data failed:', error);
//     return {
//       source: 'live',
//       data: [],
//       error: error.message
//     };
//   }
// }

async function getLiveData(disaster) {
  try {
    // Try both sources with error isolation
    const [femaData, ndmaData] = await Promise.allSettled([
      scrapeOfficialUpdates(),
      scrapeNDMAUpdates()
    ]);

    // Detailed error logging
    if (femaData.status === 'rejected') {
      console.error('FEMA Scrape Failed:', femaData.reason.stack || femaData.reason);
    }
    if (ndmaData.status === 'rejected') {
      console.error('NDMA Scrape Failed:', ndmaData.reason.stack || ndmaData.reason);
    }

    // Process results
    const successfulData = [];
    
    if (femaData.status === 'fulfilled') {
      console.log(`FEMA returned ${femaData.value.length} alerts`);
      successfulData.push(...femaData.value.map(d => ({ 
        ...d, 
        sourceSystem: 'FEMA',
        isActive: true 
      })));
    }

    if (ndmaData.status === 'fulfilled') {
      console.log(`NDMA returned ${ndmaData.value.length} alerts`);
      successfulData.push(...ndmaData.value.map(d => ({
        ...d,
        sourceSystem: 'NDMA',
        disasterNumber: d.url.split('/').pop() || 'NDMA-' + Date.now()
      })));
    }

    return {
      source: 'live',
      data: successfulData,
      freshness: 'live',
      scrapedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Live data failed:', error.stack || error);
    return {
      source: 'live',
      data: [],
      error: error.message
    };
  }
}


// ======================
// RESPONSE STRATEGIES
// ======================

// async function getLiveData() {
//   try {
//     return await getCombinedDisasterData();
//   } catch (error) {
//     console.error('Scrape failed:', error);
//     return { data: [], error: error.message };
//   }
// }


function selectBestResponse(cachedData, liveData) {
  // Priority 1: Live data with results
  if (liveData.data.length > 0) return liveData;
  
  // Priority 2: Fresh cache with results
  if (cachedData.freshness === 'fresh' && cachedData.data.length > 0) return cachedData;
  
  // Priority 3: Stale cache with results
  if (cachedData.freshness === 'stale' && cachedData.data.length > 0) {
    return {
      ...cachedData,
      notice: 'Displaying slightly outdated information'
    };
  }
  
  // Priority 4: Generate smart fallback
  return generateSmartFallback(cachedData.disasterContext);
}

function generateSmartFallback(disaster) {
  const disasterType = disaster.tags.find(tag => 
    ['flood', 'fire', 'earthquake', 'hurricane'].includes(tag.toLowerCase())
  ) || 'disaster';
  
  return {
    source: 'fallback',
    data: [{
      title: `${disasterType.toUpperCase()} Preparedness Guidelines`,
      url: `https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/${disasterType}.html`,
      source: 'Red Cross',
      timestamp: new Date().toISOString(),
      isFallback: true,
      description: `General preparedness information for ${disasterType} events`
    }],
    notice: `No recent updates found. Showing general ${disasterType} preparedness information.`
  };
}

// ======================
// RESPONSE FORMATTING
// ======================

function formatResponse(response, res) {
  res.json({
    data: response.data,
    meta: {
      source: response.source,
      freshness: response.freshness,
      timestamp: new Date().toISOString(),
      resultCount: response.data.length,
      ...(response.notice && { notice: response.notice }),
      ...(response.error && { error: response.error })
    }
  });
}

function sendFallback(res, error) {
  return formatResponse({
    source: 'fallback',
    data: [{
      title: "Disaster Response Information",
      url: "https://www.ready.gov",
      source: "FEMA",
      timestamp: new Date().toISOString(),
      isFallback: true,
      description: "General emergency preparedness resources"
    }],
    notice: `Could not retrieve updates: ${error}`
  }, res);
}

