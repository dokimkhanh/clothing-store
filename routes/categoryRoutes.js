import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware.js'
import { getCategories, createCategory, getCategoryBySlug, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { check } from 'express-validator';

const router = express.Router();

router.get('/', getCategories);

router.post('/', isAuthenticated, isAdmin, [
  check('name', 'Tên danh mục là bắt buộc và phải là chuỗi').not().isEmpty().isString(),
  check('description', 'Mô tả phải là chuỗi').optional().isString()
],
  createCategory
);

router.get('/:slug', getCategoryBySlug);

router.put('/:id', isAuthenticated, isAdmin, [
  check('name', 'Tên danh mục là bắt buộc và phải là chuỗi').not().isEmpty().isString(),
  check('description', 'Mô tả phải là chuỗi').optional().isString()
],
  updateCategory
);

router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

export default router; 