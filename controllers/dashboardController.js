import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get order count
    const orderCount = await Order.countDocuments();
    
    // Calculate total revenue from all orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } }, // Exclude cancelled orders
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get product count
    const productCount = await Product.countDocuments();
    
    // Get user count
    const userCount = await User.countDocuments();
    
    // Get recent orders (10 most recent)
    const recentOrders = await Order.find()
      .populate('user', 'email fullname')
      .populate({
        path: 'products.product',
        select: 'name slug'
      })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get top products (most frequently ordered)
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } }, // Exclude cancelled orders
      { $unwind: '$products' }, // Deconstruct the products array
      { 
        $group: { 
          _id: '$products.product', 
          totalOrders: { $sum: '$products.quantity' }
        } 
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          slug: '$productDetails.slug',
          totalOrders: 1,
          imageUrl: { $arrayElemAt: ['$productDetails.sizes.imageUrl', 0] },
          price: { $arrayElemAt: ['$productDetails.sizes.price', 0] }
        }
      }
    ]);
    
    res.json({
      orderCount,
      revenue,
      productCount,
      userCount,
      recentOrders,
      topProducts
    });
  } catch (err) {
    console.error('Lỗi khi lấy thống kê dashboard:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};