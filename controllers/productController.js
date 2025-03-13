import Product from '../models/productModel.js';
import { validationResult } from 'express-validator';

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      product
    });
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('category', '_id name slug description image')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: categoryId })
      .populate('category', '_id name slug description image')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category: categoryId });

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    console.error(`Lỗi khi lấy sản phẩm theo danh mục ${req.params.categoryId}:`, err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', '_id name slug description image');
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      message: 'Cập nhật sản phẩm thành công',
      product
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    await product.deleteOne();
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};