// // testing data
// import { supabase } from './supabase/client.js';
// import { createClient } from '@supabase/supabase-js';

// async function testInsert() {
//   const { data, error } = await supabase.from('disasters').insert([
//     {
//       title: "Test Flood",
//       location_name: "Mumbai, India",
//       description: "Flooding in Mumbai suburbs",
//       tags: ["flood"],
//       owner_id: "netrunnerX",
//       // location: {
//       //   type: "Point",
//       //   coordinates: [72.8777, 19.0760], // longitude, latitude
//       // },
//       audit_trail: { 
//         action: "insert", 
//         user_id: "netrunnerX", 
//         timestamp: new Date().toISOString() 
//       }
//     }
//   ])
//    .select();  // 👈 this tells Supabase to return the inserted rows

//   if (error) console.error("Insert error:", error);
//   else console.log("Inserted data:", data);
// }

// testInsert();


// const supabase = createClient(
//   'https://your-project-id.supabase.co',     // your Supabase URL
//   'your-anon-key'                            // your anon key
// );

// supabase
//   .channel('disasters')
//   .on(
//     'postgres_changes',
//     {
//       event: 'INSERT',
//       schema: 'public',
//       table: 'disasters'
//     },
//     (payload) => {
//       console.log('🚨 New disaster reported:', payload.new);
//     }
//   )
//   .subscribe();



// import { scrapeOfficialUpdates } from './services/officialUpdateScraperService.js';
import { scrapeNDMAUpdates } from "./services/ndmaScraperService.js";

// (async () => {
//   console.log('Testing FEMA scraper...');
//   const results = await scrapeOfficialUpdates();
//   console.log(results.length > 0 ? results : 'EMPTY RESULTS - CHECK SELECTORS');
// })();


// Temporary test route to debug NDMA specifically
export const testNDMA = async (req, res) => {
  try {
    const data = await scrapeNDMAUpdates();
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};