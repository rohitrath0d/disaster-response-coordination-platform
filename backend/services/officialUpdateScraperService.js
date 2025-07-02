// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// // import { parseLocation, getBroaderLocationParts } from '../utils/locationUtils.js';

// // Add stealth plugin to avoid bot detection
// puppeteer.use(StealthPlugin());

// const SOURCES = {
//   FEMA: {
//     url: 'https://www.fema.gov/disaster/current',
//     selectors: {
//       container: '.disaster-list',
//       // items: '.disaster-list-item',
//       items: '.new-disaster-list-item', // Updated selector
//       // title: 'h3',
//       title: 'h2.disaster-title',       // More specific
//       link: 'a',
//       date: '.date'
//     },
//     waitFor: '.disaster-list'
//   },
//   RED_CROSS: {
//     url: 'https://www.redcross.org/about-us/news-and-events/news/',
//     selectors: {
//       container: '.news-list',
//       items: '.news-item',
//       title: 'h4',
//       link: 'a',
//       date: '.date'
//     },
//     waitFor: '.news-list'
//   }
// };

// export async function scrapeOfficialUpdates(keywords) {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage'
//     ]
//   });

//   try {
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1366, height: 768 });
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//     const results = [];

//     for (const [sourceName, config] of Object.entries(SOURCES)) {
//       try {
//         console.log(`Scraping ${sourceName}...`);
//         await page.goto(config.url, {
//           waitUntil: 'domcontentloaded',
//           timeout: 30000
//         });

//         // Wait for main container
//         await page.waitForSelector(config.waitFor, { timeout: 10000 });

//         const sourceResults = await page.evaluate(({ selectors, keywords }) => {
//           return Array.from(document.querySelectorAll(selectors.items))
//             .map(item => {
//               const title = item.querySelector(selectors.title)?.textContent.trim();
//               const url = item.querySelector(selectors.link)?.href;
//               const date = item.querySelector(selectors.date)?.textContent.trim();

//               if (!title || !url) return null;

//               // Check if title contains any keyword
//               const titleLower = title.toLowerCase();
//               const hasKeyword = keywords.some(kw =>
//                 titleLower.includes(kw.toLowerCase())
//               );

//               return hasKeyword ? {
//                 title,
//                 url: url.startsWith('http') ? url : new URL(url, config.url).href,
//                 source: sourceName,
//                 date: date || 'Unknown date'
//               } : null;
//             })
//             .filter(Boolean);
//         }, { selectors: config.selectors, keywords });

//         results.push(...sourceResults);
//       } catch (error) {
//         console.error(`Error scraping ${sourceName}:`, error.message);
//         continue;
//       }
//     }

//     return results.length > 0 ? results : await getGenericDisasterInfo(page);
//   } finally {
//     await browser.close();
//   }
// }

// async function getGenericDisasterInfo(page) {
//   try {
//     await page.goto('https://www.ready.gov', { timeout: 20000 });

//     return await page.evaluate(() => {
//       const items = Array.from(document.querySelectorAll('.card'));
//       return items.map(item => ({
//         title: item.querySelector('h3')?.textContent.trim() || 'Disaster Preparedness',
//         url: item.querySelector('a')?.href || 'https://www.ready.gov',
//         source: 'Ready.gov',
//         date: 'Current',
//         isGeneric: true
//       })).slice(0, 3); // Return top 3
//     });
//   } catch (error) {
//     console.error('Failed to get generic info:', error);
//     return generateHardcodedFallback();
//   }
// }

// function generateHardcodedFallback() {
//   return [{
//     title: 'Emergency Preparedness Resources',
//     url: 'https://www.ready.gov',
//     source: 'FEMA',
//     date: 'Current',
//     isFallback: true
//   }];
// }


// // services/officialUpdateScraperService.js
// import puppeteer from 'puppeteer';

// export const scrapeOfficialUpdates = async () => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
//   });

//   try {
//     const page = await browser.newPage();

//     // Configure browser to mimic human behavior
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
//     await page.setDefaultNavigationTimeout(30000);
//     await page.setJavaScriptEnabled(true);

//     // Navigate to FEMA's current disasters page
//     await page.goto('https://www.fema.gov/disaster/current', {
//       waitUntil: 'networkidle2',
//       timeout: 45000
//     });

//     // Wait for the specific menu structure we see in your console
//     await page.waitForSelector('.usa-sidenav__sublist.menu-level-2', { timeout: 15000 });

//     // Extract disaster data from the exact structure you provided
//     const disasters = await page.evaluate(() => {
//       return Array.from(
//         document.querySelectorAll('.usa-sidenav__sublist.menu-level-2 > li > a[href^="/disaster/"]')
//       ).map(link => {
//         // Get disaster number from URL
//         const disasterNumber = link.href.split('/').pop();
//         return {
//           title: `FEMA Disaster ${disasterNumber}`,
//           url: `https://www.fema.gov${link.getAttribute('href')}`,
//           source: 'FEMA',
//           timestamp: new Date().toISOString(),
//           // Additional metadata
//           disasterNumber,
//           isActive: true,
//           type: link.textContent.includes('wildfire') ? 'Wildfire' :
//             link.textContent.includes('flood') ? 'Flood' : 'Severe Storm'
//         };
//       }).filter(disaster => !isNaN(disaster.disasterNumber)); // Filter out non-numeric IDs
//     });

//     return disasters.length > 0 ? disasters : [];

//   } catch (error) {
//     console.error('FEMA Scraper Error:', error);
//     return [];
//   } finally {
//     await browser.close();
//   }
// };


// cheerio based
// services/officialUpdateScraperService.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeOfficialUpdates = async () => {
  try {
    // 1. Fetch with identical headers to Puppeteer
    const { data } = await axios.get('https://www.fema.gov/disaster/current', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    // 2. WaitForSelector equivalent - verify container exists
    const sidebar = $('.usa-sidenav__sublist.menu-level-2');
    if (sidebar.length === 0) {
      throw new Error('FEMA sidebar container not found');
    }

    // 3. Extract disaster data (identical logic to Puppeteer)
    const disasters = [];
    
    sidebar.find('> li > a[href^="/disaster/"]').each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const disasterNumber = href.split('/').pop();
      
      if (!isNaN(disasterNumber)) {
        disasters.push({
          title: `FEMA Disaster ${disasterNumber}`,
          url: `https://www.fema.gov${href}`,
          source: 'FEMA',
          timestamp: new Date().toISOString(),
          disasterNumber,
          isActive: true,
          type: $link.text().includes('wildfire') ? 'Wildfire' :
                $link.text().includes('flood') ? 'Flood' : 'Severe Storm'
        });
      }
    });

    return disasters;

  } catch (error) {
    console.error('FEMA Scrape Error:', error.message);
    return [];
  }
};