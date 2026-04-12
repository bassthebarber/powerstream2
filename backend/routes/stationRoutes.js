// backend/routes/stationRoutes.js
// Golden TV Subsystem - Station Routes
import { Router } from 'express';
import {
  createStation,
  startStation,
  stopStation,
  getStation,
  getStationVideos,
  getStationLive,
  uploadStationVideo,
  updateStation,
  deleteStation
} from '../controllers/stationController.js';
import { listUnifiedStations } from '../controllers/platformStationsController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// ============================================================
// Required TV streaming endpoints
// ============================================================
router.post('/create', createStation);
router.post('/', createStation);
router.post('/start', startStation);
router.post('/stop', stopStation);

// ============================================================
// Platform discovery (must be before /:id)
// ============================================================
router.get('/', listUnifiedStations);

// ============================================================
// Station read endpoints (supports ObjectId or legacy slug)
// ============================================================
router.get('/:id/live', getStationLive);
router.get('/:id', getStation);
router.put('/:id', requireAuth, requireRole(['admin', 'stationOwner']), updateStation);
router.delete('/:id', requireAuth, requireRole(['admin', 'stationOwner']), deleteStation);

// Legacy VOD shelf endpoints (kept for compatibility)
router.get('/:id/videos', getStationVideos);

// POST /api/stations/:slug/videos - Upload video to station (auth required)
router.post('/:id/videos', requireAuth, requireRole(['admin', 'stationOwner']), uploadStationVideo);

export default router;
