import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import kết nối DB
import apiRoutes from './routes/index.js'; // Import router tổng hợp

dotenv.config();

connectDB(); // Kết nối với MongoDB

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sử dụng router tổng hợp
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy trang!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorResponse = {
    message: 'Đã xảy ra lỗi!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  };
  res.status(500).json(errorResponse);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server đang chạy tại port ${process.env.PORT || 3000}`);
});

export default app;
