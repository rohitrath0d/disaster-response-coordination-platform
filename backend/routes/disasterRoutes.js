import express from 'express';
import { broadcastDisaster, createDisaster, createReport, createResource, deleteDisaster, getBroadcastedDisasters, getBroadcastLogsByDisaster, getDisasterAudit, getNearbyResources, getOfficialUpdates, getSocialMediaPosts, updateDisaster, verifyImage } from '../controllers/disasterController.js';
import { extractLocationFromDescription } from '../controllers/geminiController.js';
import { getDisasters, getNearbyDisasters } from '../controllers/disasterController.js';
import { requireAuth } from '../middleware/auth.js';



const router = express.Router();
// app.use(express.json()); // ✅ This must come before routes





// router.post('/', createDisaster); // POST /api/disasters
router.post('/', requireAuth, createDisaster);
router.post('/extract-location', extractLocationFromDescription);

// router.get('/', getDisasters); // GET /api/disasters
router.get('/', requireAuth, getDisasters);
router.get('/nearby', getNearbyDisasters); // GET /api/disasters/nearby


router.get('/:id/audit', getDisasterAudit);

// auth routes.
// router.post('/', requireAuth, createDisaster);
// router.get('/', requireAuth, getDisasters);

// broadcast routes.
router.post('/:id/broadcast', requireAuth, broadcastDisaster);


// Route to List Broadcasted Disasters
router.get('/broadcasted', getBroadcastedDisasters);

//  Route to Get Broadcast Logs for a Disaster
router.get('/:id/broadcast/logs', getBroadcastLogsByDisaster);


// create resource
router.post('/:id/resources', requireAuth, createResource);
// get resources
router.get('/:id/resources', getNearbyResources);


// create report
router.post('/:id/reports', requireAuth, createReport);

// verify image -  by gemini route
router.post('/:id/verify-image', requireAuth, verifyImage);


// social media routes
router.get('/:id/social-media', getSocialMediaPosts);


router.get('/:id/official-updates', getOfficialUpdates);



// update disaster
router.put('/:id', requireAuth, updateDisaster);

// delete disaster
router.delete('/:id', requireAuth, deleteDisaster);




export default router;
