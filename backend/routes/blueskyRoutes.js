import express from 'express';
// import { getBlueskyPosts } from '../controllers/blueskyController.js';
import { fetchBlueskyPosts } from '../controllers/blueskyController.js';
const router = express.Router();

// router.get('/bluesky-posts', getBlueskyPosts);
router.get('/bluesky-posts', fetchBlueskyPosts);

export default router;
