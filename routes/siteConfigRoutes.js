import express from 'express';
import { siteConfigController } from '../controllers/siteConfigController.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/update', isAuthenticated, isAdmin, siteConfigController);

export default router;
