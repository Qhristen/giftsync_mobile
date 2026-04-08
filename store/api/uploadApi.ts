import { baseApi } from './baseApi';

export const uploadApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        upload: builder.mutation<string, string>({
            queryFn: async (uri) => {
                try {
                    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
                    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                    if (!cloudName || !uploadPreset) {
                        return { error: { status: 500, data: { message: 'Cloudinary configuration is missing' } } };
                    }

                    const formData = new FormData();
                    const fileToUpload = {
                        uri: uri,
                        type: 'image/jpeg',
                        name: uri.split('/').pop() || 'upload.jpg',
                    };

                    formData.append('file', fileToUpload as any);
                    formData.append('upload_preset', uploadPreset);

                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: { message: data.error?.message || 'Failed to upload image to Cloudinary' }
                            }
                        };
                    }

                    return { data: data.secure_url };
                } catch (error: any) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            data: { message: error.message || 'An error occurred during upload' }
                        }
                    };
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useUploadMutation } = uploadApi;
