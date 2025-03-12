import express from 'express';
import { getUserProfile, updateProfile, changePassword, deleteAddress, addAddress, updateAddress, setDefaultAddress } from '../controllers/profileController.js';
import { check } from 'express-validator';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', isAuthenticated, getUserProfile);

router.put('/update', isAuthenticated, [
  check('fullname', 'Tên không được quá 100 ký tự').optional().isLength({ max: 100 }),
  check('phone', 'Số điện thoại không hợp lệ').optional().isMobilePhone('vi-VN')
], updateProfile);

router.put('/change-password', isAuthenticated, [
  check('currentPassword', 'Mật khẩu hiện tại là bắt buộc').exists(),
  check('newPassword', 'Mật khẩu mới phải có ít nhất 6 ký tự và tối đa 20 ký tự').isLength({ min: 6, max: 20 })
], changePassword);

router.post('/address', isAuthenticated, addAddress);
router.put('/address/:id', isAuthenticated, updateAddress);
router.delete('/address/:id', isAuthenticated, deleteAddress);
router.put('/address/:id/default', isAuthenticated, setDefaultAddress);

export default router;