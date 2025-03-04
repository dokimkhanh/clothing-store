import Category from '../models/categoryModel.js';
import { validationResult } from 'express-validator';

// Lấy danh sách danh mục
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo mới một danh mục
export const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi tạo danh mục' });
  }
};

// Lấy thông tin chi tiết một danh mục
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin chi tiết một danh mục bằng slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin một danh mục
export const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi cập nhật danh mục' });
  }
};

// Xóa một danh mục
export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 