import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createAnnouncement
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.post('/announcement', authenticate, authorize('admin'), createAnnouncement);

export default router;