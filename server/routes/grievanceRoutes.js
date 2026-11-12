import express from 'express';
import {
  getGrievances,
  getGrievanceById,
  createGrievance,
  upvoteGrievance,
  getMyGrievances,
  getVoteStatus,
  getStats,
  getScrollFeed,    
  addComment 
} from '../controllers/grievanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyActionPin } from '../middleware/pinMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { getResolvedGrievances } from '../controllers/grievanceController.js';
const router = express.Router();

// Public feed routes
router.get('/', protect, getGrievances);
router.get('/stats', protect, getStats);
// Scroll Feed Routes
router.get('/feed', protect, getScrollFeed);

// Comment Route
router.post('/:id/comment', protect, addComment);
router.get('/my', protect, getMyGrievances);

// Single grievance
router.get('/:id', protect, getGrievanceById);
router.get('/:id/vote-status', protect, getVoteStatus);

// Actions requiring Action PIN
router.post(
  '/',
  protect,
  upload.array('attachments', 3),
  verifyActionPin,
  createGrievance
);

router.post('/:id/upvote', protect, verifyActionPin, upvoteGrievance);
router.get('/resolved', protect, getResolvedGrievances);

export default router;