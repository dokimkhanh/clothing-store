import axios from 'axios';
import FormData from 'form-data';

export const uploadImageToImgbb = async (base64Image) => {
    try {
        const apiKey = process.env.IMGBB_API_KEY;
        const formData = new FormData();
        formData.append('image', base64Image);

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        return {
            success: true,
            url: response.data
        };
    } catch (error) {
        console.error('Error uploading image to imgbb:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
