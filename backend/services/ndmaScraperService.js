import puppeteer from 'puppeteer';

export const scrapeNDMAUpdates = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Configure browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
    await page.setDefaultNavigationTimeout(60000); // Increased timeout

    // Navigate to NDMA Sachet portal
    await page.goto('https://sachet.ndma.gov.in/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for alert container with EXACT selector from your screenshot
    await page.waitForSelector('.FooterLogo_cardMAP__pjpUv', { 
      timeout: 60000 
    });

    // Extract alert data
    const alerts = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('.FooterLogo_cardMAP__pjpUv')
      ).map(card => {
        const titleEl = card.querySelector('div[style*="font-weight: bold"]');
        const contentEls = Array.from(card.querySelectorAll('div'))
          .filter(el => el !== titleEl && el.textContent.trim());
        
        return {
          title: titleEl?.textContent.trim() || 'NDMA Alert',
          districts: contentEls[0]?.textContent.split(',').map(d => d.trim()) || [],
          severity: card.style.backgroundColor.includes('orange') ? 'High' : 
                   card.style.backgroundColor.includes('yellow') ? 'Medium' : 'Low',
          url: window.location.href
        };
      });
    });

    // Filter and format results
    // return alerts.filter(a => a.districts.length > 0).map(alert => ({
    //   title: alert.title,
    //   description: `${alert.title} in ${alert.districts.join(', ')}`,
    //   districts: alert.districts,
    //   severity: alert.severity,
    //   timestamp: new Date().toISOString(),
    //   source: 'NDMA Sachet',
    //   type: alert.title.includes('Thunderstorm') ? 'Thunderstorm' :
    //         alert.title.includes('Lightning') ? 'Lightning' :
    //         'Weather Alert',
    //   url: alert.url,
    //   sourceSystem: 'NDMA'
    // }));

    // After getting alerts, filter and limit them
  const filteredAlerts = alerts
    .filter(a => a.districts.length > 0)
    // Sort by severity (High first)
    .sort((a, b) => {
      const severityOrder = { High: 3, Medium: 2, Low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    // Limit to 20 most important alerts
    .slice(0, 10);

     return filteredAlerts.map(alert => ({
    title: alert.title,
    districts: alert.districts,
    severity: alert.severity,
    type: /thunderstorm|lightning/i.test(alert.title) ? 'Thunderstorm' :
          /rain/i.test(alert.title) ? 'Rain' : 'Weather Alert',
    source: 'NDMA Sachet',
    timestamp: alert.timestamp || new Date().toISOString(),
    url: alert.url,
    sourceSystem: 'NDMA',
    // Add importance score for frontend sorting
    importance: alert.severity === 'High' ? 3 : 
                alert.severity === 'Medium' ? 2 : 1
  }));

    
  } catch (error) {
    console.error('NDMA Scraping Error:', error);
    return []; // Return empty array to allow FEMA data through
  } finally {
    await browser.close();
  }
};



// Puppeteer works (because it's a full browser that executes JavaScript)
// Cheerio fails (because it only parses static HTML)

// services/ndmaScraperService.js
// import axios from 'axios';
// import * as cheerio from 'cheerio';


// // services/ndmaScraperService.js
// export const scrapeNDMAUpdates = async () => {
//   try {
//     const { data } = await axios.get('https://sachet.ndma.gov.in/', {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       },
//       timeout: 10000
//     });

//     const $ = cheerio.load(data);

//     // Try multiple possible container selectors
//     const alertContainer = $('div#style-1.scrollbarhorizontal, div[class*="scrollbarhorizontal"], div.col-sm-4.col-md-3.col-lg-3.hidden-xs').first();
    
//     if (alertContainer.length === 0) {
//       console.log('Full page HTML:', $.html()); // Debugging
//       throw new Error('Alert container not found - NDMA structure changed');
//     }

//     // More flexible card selection
//     const alertCards = alertContainer.find('div[class*="FooterLogo_cardMAP"], div[style*="background-color"]');
    
//     const alerts = alertCards.map((_, card) => {
//       const $card = $(card);
      
//       const title = $card.find('div:contains("font-weight: bold")').text().trim() || 
//                    $card.find('div').first().text().trim();
      
//       const districtsText = $card.find('div').last().text().trim();
//       const districts = districtsText.split(',')
//         .map(d => d.trim())
//         .filter(d => d && !/districts?/i.test(d));

//       // Severity detection
//       const bgColor = $card.attr('style') || '';
//       let severity = 'Low';
//       if (bgColor.includes('orange')) severity = 'High';
//       else if (bgColor.includes('yellow')) severity = 'Medium';

//       return {
//         title: title || 'NDMA Alert',
//         districts,
//         severity,
//         type: /thunderstorm|lightning/i.test(title) ? 'Thunderstorm' :
//               /rain/i.test(title) ? 'Rain' : 'Weather Alert',
//         source: 'NDMA Sachet',
//         timestamp: new Date().toISOString(),
//         url: 'https://sachet.ndma.gov.in/'
//       };
//     }).get().filter(alert => alert.districts.length > 0);

//     return alerts;

//   } catch (error) {
//     console.error('NDMA Scrape Error:', error.stack || error);
//     return []; // Return empty array instead of throwing
//   }
// };