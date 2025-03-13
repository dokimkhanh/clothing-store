import axios from 'axios';
import crypto from 'crypto';
import express from 'express';
import dotenv from 'dotenv';
import moment from 'moment';
import Order from '../models/orderModel.js';

dotenv.config();

const router = express.Router();

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretkey = process.env.MOMO_SECRET_KEY;
const redirectUrl = process.env.MOMO_REDIRECT_URL;
const ipnUrl = process.env.MOMO_IPN_URL;

const requestId = partnerCode + new Date().getTime();
const orderId = requestId;
const requestType = "captureWallet";
const extraData = "";
const date = new Date();


export const createMoMoPayment = async (req, res) => {
    try {
        const amount = req.body.amount || "1";
        const orderInfo = "Momo DH " + moment(date).format('DDHHmmss');

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

        // Create a new order with pending status
        const orderData = {
            user: req.user.id,
            products: req.body.products,
            paymentMethod: 'Momo',
            address: req.body.address,
            totalAmount: amount,
            status: 'pending'
        };

        const order = new Order(orderData);
        await order.save();

        const requestBody = JSON.stringify({
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'en'
        });

        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return res.status(200).json({ paymentUrl: response.data.payUrl, orderId: order._id });
    } catch (error) {
        console.error('Error from MoMo:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

export default router;