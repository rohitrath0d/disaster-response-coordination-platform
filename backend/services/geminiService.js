import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedValue, setCacheValue } from './cacheService.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractLocationFromText = async (description) => {

  // Using Caching service in Gemini Service
  const cacheKey = `gemini:${description}`;

  // ✅ Check cache first
  const cached = await getCachedValue(cacheKey);
  if (cached) {
    console.log("⚡ Gemini cache hit");
    return cached;
  }

  try {
    // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const model = genAI.getGenerativeModel({
      // model: 'gemini-pro' 
      // model: 'models/gemini-pro' 
      model: "models/gemini-1.5-pro", // ✅ Fully qualified model ID
    });

    const prompt = `Extract the name of a city or region from this disaster report: "${description}". 
    Only return the location name.`;

    const result = await model.generateContent(prompt);

    // const result = await model.generateContent({
    //   contents: [{ parts: [{ text: prompt }] }]
    // });

    const response = result.response;
    // const locationName = response.text().trim();
    const location = response.text().trim();
    // const text = await response.text();

    // ✅ Store in cache
    await setCacheValue(cacheKey, location);

    // return locationName;
    // return response;
    return location;
    // return text.trim();

  } catch (err) {
    console.error("Gemini error:", err);
    throw new Error('Gemini location extraction failed: ' + err.message);
  }
};
