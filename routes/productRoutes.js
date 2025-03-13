import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} from '../controllers/productController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

const productValidation = [
  body('name').notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('description').notEmpty().withMessage('Mô tả không được để trống'),
  body('category').notEmpty().withMessage('Danh mục không được để trống'),
  body('stock').isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
  body('sizes').isArray().withMessage('Sizes phải là một mảng'),
  body('sizes.*.price').isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
  body('sizes.*.size').notEmpty().withMessage('Kích thước không được để trống'),
  body('sizes.*.imageUrl').notEmpty().withMessage('URL hình ảnh không được để trống')
];

router.get('/', getProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:slug', getProductBySlug);

router.post('/', isAuthenticated, isAdmin, productValidation, createProduct);
router.put('/:id', isAuthenticated, isAdmin, productValidation, updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

export default router;