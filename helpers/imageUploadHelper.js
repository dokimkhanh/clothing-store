import axios from 'axios';
import FormData from 'form-data';

export const uploadImageToFreeImage = async (imageData) => {
    try {
        const apiKey = process.env.FREEIMAGE_API_KEY;
        
        if (!apiKey) {
            throw new Error('FREEIMAGE_API_KEY is not defined in environment variables');
        }
        
        if (!imageData) {
            throw new Error('Image data is required');
        }

        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('source', imageData);
        formData.append('action', 'upload'); // Required parameter for FreeImage API
        
        const response = await axios.post('https://freeimage.host/api/1/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        
        if (!response.data || !response.data.success) {
            throw new Error(response.data?.error?.message || 'Failed to upload image');
        }
        
        return response.data.image.url;
    } catch (error) {
        console.error('Error uploading image to FreeImage:', error.message);
        throw error;
    }
};
