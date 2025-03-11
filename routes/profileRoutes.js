import express from 'express';
import { getUserProfile, updateProfile, changePassword, deleteAddress } from '../controllers/profileController.js';
import { check } from 'express-validator';

const router = express.Router();

router.get('/', getUserProfile);

router.put('/update', [
  check('fullname', 'Tên không được quá 100 ký tự').optional().isLength({ max: 100 }),
  check('phone', 'Số điện thoại không hợp lệ').optional().isMobilePhone('vi-VN')
], updateProfile);

router.put('/change-password', [
  check('currentPassword', 'Mật khẩu hiện tại là bắt buộc').exists(),
  check('newPassword', 'Mật khẩu mới phải có ít nhất 6 ký tự và tối đa 20 ký tự').isLength({ min: 6, max: 20 })
], changePassword);

router.delete('/address/:id', deleteAddress);

export default router;