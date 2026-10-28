import express from 'express';
import {
  getAllGrievances,
  getConfidentialGrievances,
  updateGrievanceStatus,
  assignGrievance,
  getAdminStats
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/grievances', getAllGrievances);
router.get('/confidential', getConfidentialGrievances);
router.get('/stats', getAdminStats);
router.put('/grievances/:id/status', updateGrievanceStatus);
router.put('/grievances/:id/assign', assignGrievance);

export default router;