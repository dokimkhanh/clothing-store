import express from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import siteConfigRoutes from './siteConfigRoutes.js';
import helperRoutes from './helperRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
const router = express.Router();

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/payment', paymentRoutes);
router.use('/site-config', siteConfigRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/helpers', helperRoutes);

export default router;
