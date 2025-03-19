import User from '../models/userModel.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, ...otherData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      ...otherData,
      password: hashedPassword
    });
    await user.save();
    res.status(201).json({
      message: 'Tạo người dùng thành công',
      user
    });
  } catch (err) {
    console.error('Lỗi khi tạo người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      users: users
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      user: user
    });
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật người dùng thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (err) {
    console.error('Lỗi khi xóa người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
