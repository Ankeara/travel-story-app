import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    //append image file to form data
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post('/image-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Set the content type to multipart/form-data
            },
        });
        return response.data; // Return the response data    
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

export default uploadImage