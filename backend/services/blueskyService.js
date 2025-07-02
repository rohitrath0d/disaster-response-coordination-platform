// services/blueskyService.js
import { BskyAgent } from '@atproto/api';
// import { Agent, AppBskyFeedGetAuthorFeed } from '@atproto/api';
// import dotenv from 'dotenv';
// dotenv.config();

// const agent = new BskyAgent({ service: 'https://bsky.social' });

// export const fetchBlueskyPosts = async (keyword = 'disaster') => {
//   await agent.login({
//     identifier: process.env.BLUESKY_HANDLE,
//     password: process.env.BLUESKY_APP_PASSWORD,
//   });

//   const feed = await agent.searchPosts({ q: keyword });

//   return feed?.data?.posts || [];
// };


// export const searchBlueskyPosts = async (req, res) => {
export const searchBlueskyPosts = async (query = "disaster") => {
  // const { q = "disaster" } = req.query;
  // const agent = new Agent({ service: "https://bsky.social" });
  const agent = new BskyAgent({ service: "https://bsky.social" });

  // try {
  //   const agent = new Agent({
  //     service: "https://bsky.social",
  //   });

  // Create a session (instead of login)
  const session = await agent.login({
    identifier: process.env.BLUESKY_HANDLE,
    password: process.env.BLUESKY_APP_PASSWORD,
  });

  const results = await agent.app.bsky.feed.searchPosts({
    // q,    //  error: q is undefined
    q: query,
    limit: 10,
  });

  return results.data.posts || [];

  // res.json({ success: true, data: feed.data.posts || [] });
}
// catch (error) {
//   console.error("Bluesky error:", error);
//   res.status(500).json({ success: false, message: "Failed to fetch Bluesky posts" });
// }
// };