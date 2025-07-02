import { supabase } from '../supabase/client.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// import { getLatLngFromLocationName } from '../services/geocodeService.js';
import { getLatLngFromLocationName } from '../services/googleMapService.js';
import { extractLocationFromText } from '../services/geminiService.js';

import axios from 'axios';
// import * as cheerio from 'cheerio';



export const createDisaster = async (req, res) => {
  try {

    // 1. First refresh the schema cache
    await supabase.rpc('flush', {});

    // 2. Extract parameters including image_url
    const {
      title,
      description,
      tags,
      owner_id,
      location_name: userProvidedLocation, // renamed to avoid conflict,
      // image_url = null,
      image_url,
      // verification_status = null, // default to null if not provided
      // verification_status: verificationStatus
    } = req.body;

    console.log(req.body);


    // Check if body exists
    // if (!req.body || Object.keys(req.body).length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Request body is missing or empty"
    //   });
    // }

    // Add validation
    // if (!req.body.title || !req.body.description) {
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }


    // Validate tags format
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(t => t) // Split by comma and trim whitespace
        : [];

    // 3. Set up audit trail
    const audit_trail = {
      action: "insert",
      user_id: owner_id,
      timestamp: new Date().toISOString(),
    };


    // ✅ If location_name is not provided, extract it from description using Gemini
    // let location_name = userProvidedLocation;
    let location_name = userProvidedLocation;

    if (!location_name) {
      try {
        location_name = await extractLocationFromText(description);
        console.log("📍 Extracted location:", location_name);
        // } catch (error) {
      } catch (extractError) {
        console.error("Location extraction failed:", extractError);
        return res.status(400).json({
          success: false,
          message: "Could not determine location from description"
        });
      }
    }

    // ✅ Get lat/lng from Google Maps
    const { lat, lng } = await getLatLngFromLocationName(location_name);

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Failed to resolve location coordinates"
      });
    }

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


    // const tagsArray = Array.isArray(tags) ? tags : [];

    // ✅ Log to debug
    console.log("Sending to RPC:", {
      title,
      location_name,
      lat,
      lng,
      image_url
    });


    // Initial verification status
    // const verification_status = verificationStatus

    // if (verification_status) {
    //   image_url ? 'pending' : null
    // }

    const verification_status = image_url ? 'pending' : null;


    // Database operation
    // Process the data...
    //  This defines a custom RPC you can call from your backend using supabase.rpc().
    // const { data, error } = await supabase.rpc('insert_disaster_with_location', {
    const { data, error } = await supabase.rpc('insert_disaster_with_location', {
      p_title: title,
      p_location_name: location_name,
      p_description: description,
      p_owner_id: owner_id,
      p_audit_trail: audit_trail,
      // p_tags: tags,
      p_tags: tagsArray,
      p_lat: lat,
      p_lng: lng,
      p_image_url: image_url || null, // Pass image_url if provided

      // p_verification_status: initialVerificationStatus || null   // Pass initial status
      // p_verification_status: image_url ? 'pending' : null,

      p_verification_status: verification_status,
    });

    console.log("RPC data:", data);

    if (error) {
      console.error("Supabase RPC Error:", error);
      return res.status(400).json({
        success: false,
        // error: error.message
        message: "Database operation failed",
        error: error.message
      })
    };

    // ⛔ `data` might be null, so check it before using `data[0]`
    // if (!data || !data[0]) {
    // if (!data || data.length === 0) {

    //   // return res.status(500).json({
    //   //   success: false,
    //   //   message: "No data returned from RPC function"
    //   // });

    //   // }

    //   console.log("📦 RPC raw return:", data);


    //   // const createdDisaster = Array.isArray(data) ? data[0] : data;
    //   // const createdDisaster = data[0];

    //   // Option 1: Fetch the newly created record
    //   const { data: createdRecord } = await supabase
    //     .from('disasters')
    //     .select('*')
    //     .eq('title', title)
    //     .order('created_at', { ascending: false })
    //     .limit(1)
    //     .single();


    //   if (createdRecord) {
    //     // Emit socket event
    //     if (global.io) {
    //       global.io.emit('disaster_updated', {
    //         action: 'create',
    //         data: createdRecord
    //       });
    //     }

    //     return res.status(201).json({
    //       success: true,
    //       message: "Disaster created successfully (recovered)",
    //       data: createdRecord
    //     });
    //   }

    //   // Option 2: Return success without data
    //   return res.status(201).json({
    //     success: true,
    //     message: "Disaster created successfully (no data returned)"
    //   });
    // }

    // Normal success case
    // const createdDisaster = data[0];


    // Handle empty response
    // let createdDisaster;
    let createdDisaster = Array.isArray(data) ? data[0] : data;
    // if (!data || data.length === 0) {
    if (!createdDisaster || !createdDisaster.id) {
      console.warn("RPC returned empty response, falling back to query");

      const { data: fetchedRecord, error: fetchError } = await supabase
        .from('disasters')
        .select('*')
        .eq('title', title)
        .order('created_at', { descending: true })
        .limit(1)
        .single();

      if (fetchError || !fetchedRecord) {
        return res.status(500).json({
          success: false,
          message: "Record may have been created but cannot be retrieved"
        });
      }
      createdDisaster = fetchedRecord;
    }
    // else {
    //   createdDisaster = data[0];
    // }


    // ✅ Emit WebSocket event after insert
    // if (global.io) {
    //   global.io.emit('disaster_updated', {
    //     action: 'create',     // or 'update' / 'delete'
    //     data: data[0]          // or updated record
    //     // data: createdDisaster
    //   });
    // }



    // If image was provided, start verification process
    // if (image_url) {
    //   try {
    //     // Call your Gemini verification endpoint
    //     const verificationResponse = await axios.post(
    //       `${process.env.API_BASE_URL}/verify-image`,
    //       {
    //         disaster_id: createdDisaster.id,
    //         image_url: image_url
    //       },
    //       { headers: { Authorization: `Bearer ${token}` } }
    //     );

    //     // Update verification status if verification was initiated
    //     if (verificationResponse.data.success) {
    //       const { data: updateData } = await supabase
    //         .from('disasters')
    //         .update({ verification_status: 'in_progress' })
    //         .eq('id', createdDisaster.id)
    //         .select();

    //       createdDisaster.verification_status = 'in_progress';
    //     }
    //   } catch (verificationError) {
    //     console.error("Verification initiation failed:", verificationError);
    //     // Don't fail the whole operation - just log the verification error
    //   }
    // }


    // Real-time update
    // Only emit socket event if creation was successful
    // if (global.io && data && data[0]) {
    if (global.io) {
      global.io.emit('disaster_updated', {
        action: 'create',
        // data: data[0]
        data: createdDisaster
      });
    }

    // res.status(201).json(data[0]);
    return res.status(201).json({
      success: true,
      message: "Disaster created successfully",
      // data[0]
      // data: data[0]
      // data: Array.isArray(data) ? data[0] : data
      data: createdDisaster

    });

    // debug log
    // console.log("🚀 Success Response:", {
    //   success: true,
    //   message: "Disaster created successfully",
    //   // data: data[0]
    //   createDisaster
    // });

  } catch (err) {
    console.error("create disaster Controller error:", err);
    return res.status(500).json({
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

    // ✅ Only allow verified disasters to be broadcasted
    if (disaster.verification_status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: `Disaster is not verified (status: ${disaster.verification_status || 'none'})`
      });
    }

    // ✅ Prevent re-broadcasts (optional but recommended)
    if (disaster.broadcasted) {
      return res.status(400).json({
        success: false,
        message: 'Disaster already broadcasted'
      });
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

    // ✅ Optionally emit WebSocket event here
    if (global.io) {
      global.io.emit('disaster_updated', {
        action: 'broadcast',
        data: { id, broadcasted: true }
      });
    }


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

    // Validate ID
    if (!id) {
      // Validate ID format (UUID)
      // if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Disaster ID is required'
      });
    }


    // First check if disaster exists
    const { data: existingDisaster, error: fetchError } = await supabase
      .from('disasters')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingDisaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    // Perform deletion
    const { error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(400).json({
        success: false,
        message: 'Delete failed',
        error: error.message
      });
    }

    // Define proper payload for Socket.IO
    const payload = {
      action: 'delete',
      id: id,
      data: {
        id: id,
        title: existingDisaster.title,
        deleted_at: new Date().toISOString()
      }
    };

    // Emit socket event
    if (global.io) {
      global.io.emit('disaster_updated', payload
        // {     // ❌ 'payload' is not defined - error
        // // global.io.emit('disaster_updated', {
        //   action: 'delete',
        //   id: id,
        //   data: { id: id, title: existing.title } // Include minimal data for reference
        // }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Disaster deleted successfully',
      id: id
    });
  } catch (err) {
    console.error('Server error during deletion:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
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


// GET /api/disasters/:id/resources/all
export const getAllResources = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('disaster_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
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


export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;

    res.json({ success: true, message: "Resource deleted successfully" });
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

    const priorityKeywords = ['urgent', 'sos', 'emergency', 'critical', 'trapped', 'need food', 'help', 'immediate'];

    const isPriority = priorityKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        disaster_id: id,
        user_id, 
        // user_id: user.id, 
        content,
        image_url,
        priority: isPriority
      }])
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

    if (isPriority && global.io) {
      global.io.emit('priority_alert', {
        disaster_id: id,
        report_id: data.id,
        message: '🚨 Priority Alert received'
      });
    }

    res.status(201).json({ success: true, message: 'Report submitted', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReportsByDisaster = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('disaster_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const verifyImage = async (req, res) => {

  // verification of image using gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { id } = req.params;
    const { title, image_url, description } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, message: "image_url is required" });
    }

    // 1. Validate the image (this would be your actual verification logic)
    // const isVerified = await verifyDisasterImage(image_url);


    // 2. Update the disaster record
    // const updated = await Disaster.update(
    //   { verification_status: isVerified ? 'verified' : 'not_verified' },
    //   { where: { id: req.params.id } }
    // );

    // 1. First update status to 'verifying'
    // await supabase
    //   .from('disasters')
    //   .update({ verification_status: 'verifying' })
    //   .eq('id', disaster_id);


    // 2. Call Gemini verification
    // const prompt = ` This image is claimed to show a disaster. Please verify if it is consistent with this description: "${description || 'No description provided'}". Reply with one of: VERIFIED, FAKE, UNCLEAR.`;


    const prompt = `
You are a disaster verification assistant analyzing images submitted by users. 

**Image Context:**
- Claimed disaster type: ${title || 'Not specified'}
- Description provided: "${description || 'No description provided'}"

**Verification Instructions:**
1. Carefully analyze the image content
2. Compare it to the provided context
3. Determine if the image genuinely shows the claimed disaster
4. Consider these verification levels:
   - VERIFIED: Image clearly matches the description
   - UNCLEAR: Cannot confirm due to poor quality or lack of clear evidence
   - FAKE: Clear signs of manipulation or unrelated content

**Response Format:**
Return a JSON object with:
{
  "verification_status": "VERIFIED"|"UNCLEAR"|"FAKE",
  "confidence": "high"|"medium"|"low",
  "analysis": "Brief explanation of your assessment",
  "suggestions": "How to improve verification if unclear"
}

**Important Notes:**
- Be conservative with VERIFIED status
- Flag any suspicious elements
- Consider typical disaster characteristics
- Note any inconsistencies
`;

    // ✅ Download image and convert to base64
    // converting url to base64 format so that llm can understand it
    const imageResponse = await axios.get(image_url, {
      responseType: 'arraybuffer'
    });

    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg/png'; // ✅ FIXED

    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

    // ✅ Prepare Gemini model
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

    // const result = await model.generateContent([
    //   { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: '' } }] }
    // ]);

    // const result = await model.generateContent(prompt,
    //   { mimeType: "image/jpeg", data: image_url } // Assuming you pass base64 image data
    // );

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    const responseText = result.response.text().trim().toUpperCase();

    // 3. Determine status
    let status = 'pending';
    if (responseText.includes('VERIFIED')) status = 'verified';
    else if (responseText.includes('FAKE')) status = 'fake';
    else if (responseText.includes('UNCLEAR')) status = 'unclear';

    // Optional: update the report if a report_id is provided
    // if (req.body.report_id) {
    //   await supabase.from('reports')
    //     .update({ verification_status: status })
    //     .eq('id', req.body.report_id);
    // }

    await supabase
      .from('disasters')
      .update({
        verification_status: status,
        // verification_details: verificationResult.message,
        image_url: image_url
      })
      .eq('id', id);

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