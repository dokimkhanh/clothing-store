import express from 'express';
import { createPaymentUrl, verifyPayment } from '../controllers/vnpayController.js';
import { createMoMoPayment } from '../controllers/momoController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Change from router.use to router.post to be more specific
router.post('/vnpay', isAuthenticated, createPaymentUrl);
router.post('/vnpay/verify', isAuthenticated, verifyPayment);
router.use('/momo', isAuthenticated, createMoMoPayment);

export default router;