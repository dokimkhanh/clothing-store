import express from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js'; 
import categoryRoutes from './categoryRoutes.js'; 
import paymentRoutes from './paymentRoutes.js';
const router = express.Router();

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes); 
router.use('/categories', categoryRoutes); 
router.use('/payment', paymentRoutes);

export default router;
