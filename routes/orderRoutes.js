import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

const orderValidation = [
  body('user').notEmpty().withMessage('Người dùng không được để trống'),
  body('products').isArray({ min: 1 }).withMessage('Phải có ít nhất một sản phẩm'),
  body('products.*.product').notEmpty().withMessage('Sản phẩm không được để trống'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
  body('paymentMethod').isIn(['VNPay', 'Momo', 'Tiền mặt']).withMessage('Phương thức thanh toán không hợp lệ'),
  body('address').notEmpty().withMessage('Địa chỉ không được để trống')
];

const updateOrderValidation = [
  body('user').optional().notEmpty().withMessage('Người dùng không được để trống'),
  body('products').optional().isArray({ min: 1 }).withMessage('Phải có ít nhất một sản phẩm'),
  body('products.*.product').optional().notEmpty().withMessage('Sản phẩm không được để trống'),
  body('products.*.quantity').optional().isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
  body('paymentMethod').optional().isIn(['VNPay', 'Momo', 'Tiền mặt']).withMessage('Phương thức thanh toán không hợp lệ'),
  body('address').optional().notEmpty().withMessage('Địa chỉ không được để trống')
];

router.post('/', isAuthenticated, orderValidation, createOrder);
router.get('/', isAuthenticated, getOrders);
router.get('/:id', isAuthenticated, getOrderById);
router.put('/:id', isAuthenticated, updateOrderValidation, updateOrder);
router.delete('/:id', isAuthenticated, deleteOrder);

export default router;
