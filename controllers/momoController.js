import axios from 'axios';
import crypto from 'crypto';
import express from 'express';
import dotenv from 'dotenv';
import moment from 'moment';


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


export const createMoMoPayment = (req, res) => {
    const amount = req.body.amount || "1";
    const orderInfo = "Momo DH " + moment(date).format('DDHHmmss');

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

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

    axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        // console.log('Response from MoMo:', response.data);
        return res.status(200).json({ paymentUrl: response.data.payUrl });
    }).catch(error => {
        console.error('Error from MoMo:', error);
    });
};

export default router;