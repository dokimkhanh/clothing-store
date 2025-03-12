import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin người dùng:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const updateFields = {};
    if (req.body.fullname !== undefined) updateFields.fullname = req.body.fullname;
    if (req.body.phone !== undefined) updateFields.phone = req.body.phone;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (err) {
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
    const user = await User.findById(req.user.id);
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
    console.error('Lỗi khi đổi mật khẩu:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!req.body.address || typeof req.body.address !== 'object' || req.body.address === null) {
      return res.status(400).json({ message: 'Dữ liệu địa chỉ không hợp lệ' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { address: req.body.address } },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: 'Thêm địa chỉ thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Lỗi khi thêm địa chỉ:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    if (!addressId) {
      return res.status(400).json({ message: 'ID địa chỉ không được cung cấp' });
    }

    if (!req.body.address || typeof req.body.address !== 'object' || req.body.address === null) {
      return res.status(400).json({ message: 'Dữ liệu địa chỉ không hợp lệ' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const addressExists = user.address.some(addr => addr._id.toString() === addressId);
    if (!addressExists) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ với ID đã cung cấp' });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        "address._id": addressId
      },
      {
        $set: {
          "address.$": {
            _id: addressId,
            ...req.body.address
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật địa chỉ:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    if (!addressId) {
      return res.status(400).json({ message: 'Không tìm thấy địa chỉ được cung cấp' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Lỗi khi xóa địa chỉ:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    
    if (!addressId) {
      return res.status(400).json({ message: 'ID địa chỉ chưa được cung cấp' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tìm vị trí của địa chỉ trong mảng
    const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ với ID đã cung cấp' });
    }

    // Nếu địa chỉ đã ở vị trí đầu tiên, không cần thay đổi
    if (addressIndex === 0) {
      return res.json({
        success: true,
        message: 'Địa chỉ này đã là mặc định',
        user: user
      });
    }

    // Lấy địa chỉ cần đặt làm mặc định
    const defaultAddress = user.address[addressIndex];
    
    // Tạo mảng địa chỉ mới
    const newAddresses = [...user.address];
    newAddresses.splice(addressIndex, 1); // Xóa địa chỉ khỏi vị trí hiện tại
    newAddresses.unshift(defaultAddress); // Thêm vào đầu mảng

    // Cập nhật mảng địa chỉ trong cơ sở dữ liệu
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { address: newAddresses } },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Lỗi khi đặt địa chỉ mặc định:', err.message);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};