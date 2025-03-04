import express from 'express';
import { createPaymentUrl } from '../controllers/vnpayController.js';
import { createMoMoPayment } from '../controllers/momoController.js';

const router = express.Router();

router.use('/vnpay', createPaymentUrl);
router.use('/momo', createMoMoPayment);

export default router;
