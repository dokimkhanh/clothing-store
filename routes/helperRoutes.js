import express from 'express';
import { uploadImage } from '../controllers/helperController.js';

const router = express.Router();

router.post('/upload-image', uploadImage);

export default router;
