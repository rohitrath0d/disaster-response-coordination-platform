import { extractLocationFromText } from '../services/geminiService.js';

export const extractLocationFromDescription = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description)
      return res.status(400).json({ success: false, message: "Description required" });

    const location = await extractLocationFromText(description);

    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
