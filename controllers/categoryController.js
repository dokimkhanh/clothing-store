import Category from '../models/categoryModel.js';
import { validationResult } from 'express-validator';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

export const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }

  try {
    const newCategory = new Category(req.body);
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      category: newCategory
    });
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo danh mục',
      error: err.message
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Lấy danh mục thành công',
      category
    });
  } catch (err) {
    console.error('Error fetching category by ID:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (err) {
    console.error('Error fetching category by slug:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

export const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      category: updatedCategory
    });
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục',
      error: err.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Xóa danh mục thành công',
      category: deletedCategory
    });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};