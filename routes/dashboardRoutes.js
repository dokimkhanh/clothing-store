import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', isAuthenticated, isAdmin, getDashboardStats);

export default router;