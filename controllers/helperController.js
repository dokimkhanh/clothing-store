import { uploadImageToFreeImage } from '../helpers/imageUploadHelper.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        const base64Image = req.body.image; 
        const imageUrl = await uploadImageToFreeImage(base64Image);
        
        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl
        });
    } catch (error) {
        console.error('Error in uploadImage controller:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};
