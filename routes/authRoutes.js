import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { check } from 'express-validator';

const router = express.Router();

router.post('/register', [
        check('email', 'Email không hợp lệ').isEmail(),
        check('password', 'Mật khẩu phải có ít nhất 6 ký tự và tối đa 20 ký tự').isLength({ min: 6, max: 20 })
    ],
    registerUser
);

router.post('/login', [
    check('email', 'Email hoặc số điện thoại không hợp lệ').not().isEmpty(),
    check('password', 'Mật khẩu là bắt buộc').exists()
],
    loginUser
);

export default router; 