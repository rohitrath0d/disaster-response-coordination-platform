import { searchBlueskyPosts } from '../services/blueskyService.js';
import { supabase } from '../supabase/client.js';

// export const getBlueskyPosts = async (req, res) => {
//   try {
//     const keyword = req.query.q || 'disaster';
//     const posts = await fetchBlueskyPosts(keyword);
//     res.json({ success: true, data: posts });
//   } catch (err) {
//     console.error('Bluesky error:', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch Bluesky posts' });
//   }
// };

// Delay helper - throttling requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchBlueskyPosts = async (req, res) => {
  try {
    const q = req.query.q || "disaster";
    const posts = await searchBlueskyPosts(q);

    // ✅ Filter out low-quality or spammy posts (optional)
    const filtered = posts.filter((p) => {
      const text = p.record?.text?.toLowerCase() || "";
      return text.length > 30 && !text.includes("nft") && !text.includes("spam");
    });


    // ✅ Emit each post over WebSocket
    if (global.io && Array.isArray(posts)) {

      // posts.forEach(async (post) => {
      //   global.io.emit("social_media_updated", { data: post });
      //   await delay(3000); // ✅ throttle: emit every 500ms (adjust if needed)
      // });

      for (const post of posts) {
        global.io.emit("social_media_updated", { data: post });
        await delay(500); // ✅ throttle: emit every 500ms (adjust if needed)
      }


      // ✅ Cache posts in Supabase (optional but useful)
      const inserts = filtered.map((post) => ({
        platform: "bluesky",
        author_handle: post.author?.handle || "",
        content: post.record?.text || "",
        link: post.embed?.external?.uri || null,
        raw: post
      }));

      if (inserts.length > 0) {
        await supabase.from("social_media_posts").insert(inserts);
      }


    }

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Bluesky error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Bluesky posts",
      error: error.message,
    });
  }
};