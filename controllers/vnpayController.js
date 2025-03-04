import express from 'express';
import axios from 'axios';
import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

export const createPaymentUrl = (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = process.env.VNPAY_TNM_CODE;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = moment(date).format('DDHHmmss');
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + moment(date).format('DDHHmmss');
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = req.body.amount * 100;
    vnp_Params['vnp_ReturnUrl'] = process.env.VNPAY_RETURN_URL;
    vnp_Params['vnp_IpAddr'] = '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = moment(date).format('YYYYMMDDHHmmss');

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    const paymentUrl = process.env.VNPAY_URL + '?' + qs.stringify(vnp_Params, { encode: false });

    return res.json({ paymentUrl });
};

export const vnpayReturn = (req, res, next) => {
    let vnp_Params = req.query;

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNPAY_HASH_SECRET;

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        return res.json({ code: vnp_Params['vnp_ResponseCode'] });
    } else {
        return res.json({ code: '97' });
    }
};

export const vnpayIpn = (req, res, next) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentStatus = '0';
    const checkOrderId = true;
    const checkAmount = true;
    if (secureHash === signed) {
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus === '0') {
                    if (rspCode === '00') {
                        res.status(200).json({ RspCode: '00', Message: 'Success' });
                    } else {
                        res.status(200).json({ RspCode: '00', Message: 'Success' });
                    }
                } else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            } else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        } else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
};

export const queryDr = (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    const vnp_TmnCode = process.env.VNPAY_TNM_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnp_Api = process.env.VNPAY_API;

    const vnp_TxnRef = req.body.orderId;
    const vnp_TransactionDate = req.body.transDate;

    const vnp_RequestId = moment(date).format('HHmmss');
    const vnp_Version = '2.1.0';
    const vnp_Command = 'querydr';
    const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    const vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const currCode = 'VND';
    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    const data = `${vnp_RequestId}|${vnp_Version}|${vnp_Command}|${vnp_TmnCode}|${vnp_TxnRef}|${vnp_TransactionDate}|${vnp_CreateDate}|${vnp_IpAddr}|${vnp_OrderInfo}`;
    const hmac = crypto.createHmac('sha512', secretKey);
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

    const dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };

    axios.post(vnp_Api, dataObj)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
};

export const refund = (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    const vnp_TmnCode = process.env.VNPAY_TNM_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnp_Api = process.env.VNPAY_API;

    const vnp_TxnRef = req.body.orderId;
    const vnp_TransactionDate = req.body.transDate;
    const vnp_Amount = req.body.amount * 100;
    const vnp_TransactionType = req.body.transType;
    const vnp_CreateBy = req.body.user;

    const currCode = 'VND';

    const vnp_RequestId = moment(date).format('HHmmss');
    const vnp_Version = '2.1.0';
    const vnp_Command = 'refund';
    const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    const vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    const vnp_TransactionNo = '0';

    const data = `${vnp_RequestId}|${vnp_Version}|${vnp_Command}|${vnp_TmnCode}|${vnp_TransactionType}|${vnp_TxnRef}|${vnp_Amount}|${vnp_TransactionNo}|${vnp_TransactionDate}|${vnp_CreateBy}|${vnp_CreateDate}|${vnp_IpAddr}|${vnp_OrderInfo}`;
    const hmac = crypto.createHmac('sha512', secretKey);
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

    const dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };

    axios.post(vnp_Api, dataObj)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
};

const sortObject = (obj) => {
    const sorted = {};
    const str = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
    }
    return sorted;
};

export default router;