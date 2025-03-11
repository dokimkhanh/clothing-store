import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }

    console.error('Lỗi khi lấy thông tin người dùng:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const updateFields = {};
    if (req.body.fullname !== undefined) updateFields.fullname = req.body.fullname;
    if (req.body.phone !== undefined) updateFields.phone = req.body.phone;
    
    if (req.body.address !== undefined) {
      if (Array.isArray(req.body.address)) {
        const validAddresses = req.body.address.filter(addr =>
          typeof addr === 'object' && addr !== null
        );

        if (validAddresses.length > 0) {
          updateFields.address = validAddresses;
        }
      }
      else if (typeof req.body.address === 'object' && req.body.address !== null) {
        const currentAddresses = user.address || [];
        updateFields.address = [...currentAddresses, req.body.address];
      }
    }
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }

    console.error('Lỗi khi cập nhật thông tin người dùng:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }

    console.error('Lỗi khi đổi mật khẩu:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};


export const deleteAddress = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const addressId = req.params.id;
    
    if (!addressId) {
      return res.status(400).json({ message: 'Không tìm thấy địa được cung cấp' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.user.id,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const addressRemoved = !updatedUser.address.some(addr => addr._id.toString() === addressId);
    
    if (!addressRemoved) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ với ID đã cung cấp' });
    }

    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công',
      user: updatedUser
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }

    console.error('Lỗi khi xóa địa chỉ:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};