import axios from 'axios';

export async function uploadFile(file: File, setProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ddjg998lp/upload';
            const CLOUDINARY_UPLOAD_PRESET = 'repoassist';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            await axios.post(CLOUDINARY_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (setProgress) {
                        const total = progressEvent.total ?? 1; // default to 1 if total is undefined
                        const progress = Math.round((progressEvent.loaded * 100) / total);
                        console.log(`Progress: ${progress}%`);
                        setProgress(progress);
                    }
                },
            }).then((response) => {
                resolve(response.data.secure_url);
            }).catch((error) => {
                console.error('Error uploading to Cloudinary:', error);
                reject(error);
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            reject(error);
        }
    });
}
