import express from 'express';
import {
  register,
  login,
  getMe,
  verifyPin,
  updatePin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/verify-pin', protect, verifyPin);
router.put('/update-pin', protect, updatePin);

export default router;