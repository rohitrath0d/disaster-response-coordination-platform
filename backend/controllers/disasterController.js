import { supabase } from '../supabase/client.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// import { getLatLngFromLocationName } from '../services/geocodeService.js';
import { getLatLngFromLocationName } from '../services/googleMapService.js';
import { extractLocationFromText } from '../services/geminiService.js';

import axios from 'axios';
// import cheerio from 'cheerio';
import * as cheerio from 'cheerio';



export const createDisaster = async (req, res) => {
  try {
    const {
      title,
      // location_name,
      description,
      tags,
      owner_id,
      location_name: userProvidedLocation // renamed to avoid conflict
    } = req.body;

    const audit_trail = {
      action: "insert",
      user_id: owner_id,
      timestamp: new Date().toISOString(),
    };


    // ✅ If location_name is not provided, extract it from description using Gemini
    let location_name = userProvidedLocation;

    if (!location_name) {
      location_name = await extractLocationFromText(description);
      console.log("📍 Extracted location:", location_name);
    }

    // ✅ Get lat/lng from Google Maps
    const { lat, lng } = await getLatLngFromLocationName(location_name);

    // Convert to PostGIS-compatible format
    // once you use the Supabase RPC function, you don’t need to manually create the POINT(...) string like this:
    // const location = `POINT(${lng} ${lat})`;

    // const { data, error } = await supabase
    //   .from('disasters')
    //   .insert([
    //     {
    //       title,
    //       location_name,
    //       description,
    //       tags,
    //       owner_id,
    //       audit_trail,

    //       // location added from geocoding api
    //       location
    //     }
    //   ])
    //   .select();

    // ✅ Log to debug
    console.log("Sending to RPC:", {
      title,
      location_name,
      lat,
      lng,
    });


    //  This defines a custom RPC you can call from your backend using supabase.rpc().
    const { data, error } = await supabase.rpc('insert_disaster_with_location', {
      p_title: title,
      p_location_name: location_name,
      p_description: description,
      p_tags: tags,
      p_owner_id: owner_id,
      p_audit_trail: audit_trail,
      p_lat: lat,
      p_lng: lng
    });


    if (error) {
      console.error("Supabase RPC Error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to create disaster",
        error: error.message
      })
    };


    // ✅ Emit WebSocket event after insert
    if (global.io) {
      global.io.emit('disaster_updated', {
        action: 'create',     // or 'update' / 'delete'
        data: data[0]          // or updated record
      });
    }

    // res.status(201).json(data[0]);
    res.status(201).json({
      success: true,
      message: "Disaster created successfully",
      // data[0]
      data: data[0]
    });

    // debug log
    console.log("🚀 Success Response:", {
      success: true,
      message: "Disaster created successfully",
      data: data[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error || Error in create disaster APi",
      error: err.message
    });
  }
};


export const getDisasters = async (req, res) => {
  try {
    // const { tag } = req.query;

    // Adding pagination: to prevent from loading all at once.
    const { tag, limit = 10, offset = 0 } = req.query;

    // let query = supabase.from('disasters').select('*');
    let query = supabase
      .from('disasters')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // const { data, error } = await query.order('created_at', { ascending: false });
    const { data, error } = await query;


    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getNearbyDisasters = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const { data, error } = await supabase.rpc('get_nearby_disasters', {
      center_lat: parseFloat(lat),
      center_lng: parseFloat(lng),
      search_radius_km: parseFloat(radius)
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getDisasterAudit = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('disasters')
      .select('audit_trail')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      audit: data.audit_trail
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const broadcastDisaster = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the disaster
    const { data: disaster, error: fetchError } = await supabase
      .from('disasters')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !disaster) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }

    const message = `ALERT: ${disaster.title} reported at ${disaster.location_name}. Stay safe.`;

    // Simulate broadcast (could be Twilio, SendGrid, etc.)
    const channels = ['email', 'sms', 'twitter']; // pretend we broadcast to all

    // Save broadcast logs
    for (const channel of channels) {
      await supabase.from('broadcast_log').insert([
        {
          disaster_id: id,
          channel,
          message
        }
      ]);
    }

    // Mark disaster as broadcasted
    await supabase
      .from('disasters')
      .update({ broadcasted: true })
      .eq('id', id);

    res.status(200).json({
      success: true,
      message: `Disaster broadcasted via ${channels.join(', ')}`,
      data: {
        disaster_id: id,
        broadcast_channels: channels
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getBroadcastedDisasters = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('disasters')
      .select('*')
      .eq('broadcasted', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getBroadcastLogsByDisaster = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('broadcast_log')
      .select('*')
      .eq('disaster_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('disasters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Update failed', error: error.message });
    }


    // ✅ Emit WebSocket event after insert
    if (global.io) {
      global.io.emit('disaster_updated', {
        action: 'update',
        data: data
      });
    }

    res.status(200).json({ success: true, message: 'Disaster updated successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: 'Delete failed', error: error.message });
    }

    if (global.io) {
      global.io.emit('disaster_updated', { 
        action: 'delete', 
        id: id,
      });
    }


    res.status(200).json({ success: true, message: 'Disaster deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location_name, lat, lng, type } = req.body;

    if (!name || !lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        message: 'name, lat, lng, and type are required'
      });
    }

    const location = `POINT(${lng} ${lat})`;

    const { data, error } = await supabase
      .from('resources')
      .insert([{
        disaster_id: id,
        name,
        location_name,
        location,
        type
      }])
      .select()
      .single();

    if (error) throw error;

    // ✅ Emit Socket.IO event
    if (global.io) {
      global.io.emit('resources_updated', {
        disaster_id: id,
        resource_id: data.id,
        message: 'New resource added'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getNearbyResources = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon, radius = 20 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }

    const { data, error } = await supabase.rpc('get_nearby_resources', {
      disaster: id,
      center_lat: parseFloat(lat),
      center_lng: parseFloat(lon),
      radius_km: parseFloat(radius)
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, content, image_url } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ success: false, message: 'user_id and content are required' });
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([{ disaster_id: id, user_id, content, image_url }])
      .select()
      .single();

    if (error) throw error;

    if (global.io) {
      global.io.emit('social_media_updated', {
        disaster_id: id,
        report_id: data.id,
        message: 'New report submitted'
      });
    }
    res.status(201).json({ success: true, message: 'Report submitted', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const verifyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, description } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, message: "image_url is required" });
    }

    const prompt = `
This image is claimed to show a disaster. Please verify if it is consistent with this description:
"${description || 'No description provided'}".
Reply with one of: VERIFIED, FAKE, UNCLEAR.`;

    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

    // const result = await model.generateContent([
    //   { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: '' } }] }
    // ]);
    const result = await model.generateContent(prompt);


    const responseText = result.response.text().trim().toUpperCase();

    let status = 'pending';
    if (responseText.includes('VERIFIED')) status = 'verified';
    else if (responseText.includes('FAKE')) status = 'fake';
    else if (responseText.includes('UNCLEAR')) status = 'unclear';

    // Optional: update the report if a report_id is provided
    if (req.body.report_id) {
      await supabase.from('reports')
        .update({ verification_status: status })
        .eq('id', req.body.report_id);
    }

    res.json({
      success: true,
      message: 'Image verified',
      result: responseText,
      verification_status: status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getSocialMediaPosts = async (req, res) => {
  try {
    const { id } = req.params;

    // Simulated social media posts
    const mockPosts = [
      {
        user: "@localwatch",
        text: "Flood near Kanke Road. People stranded. Need help urgently!",
        timestamp: new Date().toISOString()
      },
      {
        user: "@reliefBot",
        text: "Evacuation ongoing in Ranchi outskirts. No need to panic.",
        timestamp: new Date().toISOString()
      },
      {
        user: "@SOSDelhi",
        text: "SOS SOS SOS — trapped in Kurla east, elderly inside!",
        timestamp: new Date().toISOString()
      }
    ];

    // Priority classifier
    const priorityKeywords = ["urgent", "sos", "emergency", "help", "trapped"];

    const classified = mockPosts.map((post) => {
      const isPriority = priorityKeywords.some(keyword =>
        post.text.toLowerCase().includes(keyword)
      );

      return {
        ...post,
        priority: isPriority
      };
    });

    res.json({ success: true, data: classified });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// static mock updates
export const getOfficialUpdates = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧪 Simulated official updates (can be from NDMA, FEMA, etc.)
    const mockUpdates = [
      {
        title: "NDMA issues new flood guidelines for 2025",
        source: "NDMA India",
        link: "https://ndma.gov.in/latest-updates"
      },
      {
        title: "Red Cross sets up 5 shelters in Ranchi",
        source: "Indian Red Cross",
        link: "https://redcrossindia.org/alerts"
      },
      {
        title: "Heavy rains predicted over Eastern regions",
        source: "IMD",
        link: "https://mausam.imd.gov.in/"
      }
    ];

    res.json({ success: true, data: mockUpdates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// realtime mock updates
// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     // Example: NDMA India (You can replace this with any real source)

//     // const { data } = await axios.get('https://ndma.gov.in/latest-updates');  // --> this has  been deprecated
//         const { data } = await axios.get('https://indianredcross.org/press.html');
//     const $ = cheerio.load(data);

//     // 🧠 This may vary site-by-site: use browser inspect tool to fine-tune
//     $('a').each((i, el) => {
//       const title = $(el).text().trim();
//       const link = $(el).attr('href');

//       if (title && link && link.startsWith('http')) {
//         updates.push({
//           title,
//           link,
//           source: 'NDMA India'
//         });
//       }
//     });

//     res.json({ success: true, data: updates.slice(0, 10) }); // Limit to 10 updates
//   } catch (err) {
//     console.error('Scraper error:', err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };



// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     const { data } = await axios.get('https://www.ndtv.com/topic/floods');
//     const $ = cheerio.load(data);

//     $('.news_Itm').each((i, el) => {
//       const title = $(el).find('.newsHdng').text().trim();
//       const link = $(el).find('a').attr('href');

//       if (title && link) {
//         updates.push({
//           title,
//           link,
//           source: 'NDTV'
//         });
//       }
//     });

//     return res.json({ success: true, data: updates.slice(0, 5) });
//   } catch (err) {
//     console.error("🔴 Error fetching updates:", err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };


// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     const { data } = await axios.get('https://www.ndtv.com/topic/floods');
//     const $ = cheerio.load(data);

//     $('.list-content').each((i, el) => {
//       const title = $(el).find('.newsHdng a').text().trim();
//       const link = $(el).find('.newsHdng a').attr('href');

//       if (title && link) {
//         updates.push({
//           title,
//           link,
//           source: 'NDTV'
//         });
//       }
//     });

//     return res.json({ success: true, data: updates.slice(0, 5) });
//   } catch (err) {
//     console.error("🔴 Error fetching updates:", err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };


// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     // const { data } = await axios.get('https://reliefweb.int/updates');
//         const { data } = await axios.get('https://indianredcross.org/press.html');

//     const $ = cheerio.load(data);

//     $('.rw-list-item').each((i, el) => {
//       const title = $(el).find('.rw-list-item__title a').text().trim();
//       const link = $(el).find('.rw-list-item__title a').attr('href');

//       if (title && link) {
//         updates.push({
//           title,
//           link: `https://reliefweb.int${link}`,
//           source: 'ReliefWeb'
//         });
//       }
//     });

//     return res.json({ success: true, data: updates.slice(0, 5) });
//   } catch (err) {
//     console.error("🔴 Error fetching updates:", err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };


// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     const { data } = await axios.get('https://indianredcross.org/press.html');
//     const $ = cheerio.load(data);

//     $('ul li a').each((i, el) => {
//       const title = $(el).text().trim();
//       const href = $(el).attr('href');

//       if (title && href) {
//         updates.push({
//           title,
//           link: href.startsWith('http')
//             ? href
//             : `https://indianredcross.org/${href}`,
//           source: 'Indian Red Cross'
//         });
//       }
//     });

//     res.json({ success: true, data: updates.slice(0, 5) });
//   } catch (err) {
//     console.error('Scraper error:', err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };


// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const updates = [];

//     const response = await axios.get('https://www.fema.gov/press-release');
//     const $ = cheerio.load(response.data);

//     $('.node__title a').each((i, el) => {
//       const title = $(el).text().trim();
//       const href = $(el).attr('href');

//       if (title && href) {
//         updates.push({
//           title,
//           link: `https://www.fema.gov${href}`,
//           source: 'FEMA'
//         });
//       }
//     });

//     return res.json({ success: true, data: updates.slice(0, 5) });
//   } catch (err) {
//     console.error("🔴 Error fetching FEMA updates:", err.message);
//     console.error(err.stack);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };

// export const getOfficialUpdates = async (req, res) => {
//   try {
//     const response = await axios.get('https://www.fema.gov/rss/updates.xml');
//     const xml = response.data;

//     const parser = new xml2js.Parser();
//     const result = await parser.parseStringPromise(xml);

//     const items = result.rss.channel[0].item || [];

//     const updates = items.slice(0, 5).map((item) => ({
//       title: item.title[0],
//       link: item.link[0],
//       source: 'FEMA'
//     }));

//     res.json({ success: true, data: updates });
//   } catch (err) {
//     console.error("🔴 Error fetching FEMA RSS:", err.message);
//     res.status(500).json({ success: false, message: 'Failed to fetch official updates' });
//   }
// };