import express from 'express';
import { body } from 'express-validator';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

const userValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Vai trò không hợp lệ')
];

const updateUserValidation = [
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Vai trò không hợp lệ'),
];

router.post('/', isAuthenticated, isAdmin, userValidation, createUser);
router.get('/', isAuthenticated, isAdmin, getUsers);
router.get('/:id', isAuthenticated, isAdmin, getUserById);
router.put('/:id', isAuthenticated, isAdmin, updateUserValidation, updateUser);
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

export default router; 