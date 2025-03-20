import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  paymentMethod: {
    type: String,
    enum: ['VNPay', 'Momo', 'COD'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Thêm trường để lưu mã giao dịch từ cổng thanh toán
  transactionId: {
    type: String,
    trim: true
  },
  // Thêm trường để lưu thông tin chi tiết về giao dịch
  transactionInfo: {
    transactionNo: String,
    payDate: String,
    bankCode: String,
    cardType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;