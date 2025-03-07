import { uploadImageToImgbb } from '../helpers/imageUploadHelper.js';

export const uploadImage = async (req, res) => {

    const base64Image = req.body.image; // Expecting base64 string in the request body
    const response = await uploadImageToImgbb(base64Image);
    if (response.success) {
        res.status(200).json({ imageUrl: response });
    } else {
        res.status(500).json({ message: 'Error uploading image', error: response.error });
    }

};
