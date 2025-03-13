import Order from '../models/orderModel.js';
import { validationResult } from 'express-validator';

export const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const order = new Order(req.body);
        await order.save();
        res.status(201).json({
            message: 'Tạo đơn hàng thành công',
            order
        });
    } catch (err) {
        console.error('Lỗi khi tạo đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'email').populate('products.product', 'name');
        res.json(orders);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Thiết lập các tham số phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const orders = await Order.find({ user: userId })
            .populate('products.product', 'name price images slug') 
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);
        
        const totalOrders = await Order.countDocuments({ user: userId });
        
        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalItems: totalOrders,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng của người dùng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'email').populate('products.product', 'name');
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        res.json(order);
    } catch (err) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.json({
            message: 'Cập nhật đơn hàng thành công',
            order: updatedOrder
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await order.deleteOne();
        res.json({ message: 'Xóa đơn hàng thành công' });
    } catch (err) {
        console.error('Lỗi khi xóa đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};