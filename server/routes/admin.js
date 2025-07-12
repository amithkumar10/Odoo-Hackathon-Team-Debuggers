import express from 'express';
import {
  getDashboardStats,
  getUsers,
  banUser,
  unbanUser,
  moderateContent,
  getReports
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.put('/users/:userId/ban', authenticate, authorize('admin'), banUser);
router.put('/users/:userId/unban', authenticate, authorize('admin'), unbanUser);
router.post('/moderate', authenticate, authorize('admin'), moderateContent);
router.get('/reports', authenticate, authorize('admin'), getReports);

export default router;