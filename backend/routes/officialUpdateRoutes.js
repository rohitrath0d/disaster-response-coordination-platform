// const express = require('express');
// const { getOfficialUpdates } = require('../controllers/officialUpdatesController');
// const router = express.Router();


// module.exports = router;

import express from 'express';
// import { scrapeOfficialUpdates } from '../controllers/officialUpdatesController.js';
import { getOfficialUpdates } from '../controllers/officialUpdatesController.js';
import rateLimit from 'express-rate-limit';
// import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const scraperLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many update requests, please try again later'
});

router.get('/:id', scraperLimiter, getOfficialUpdates);

export default router;