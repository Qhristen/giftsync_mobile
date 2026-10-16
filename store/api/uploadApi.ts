import ReactNativeBlobUtil from 'react-native-blob-util';

import { baseApi } from './baseApi';

type CloudinaryUploadResponse = {
    secure_url?: string;
    error?: {
        message?: string;
    };
};

const MIME_TYPES: Record<string, string> = {
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

const getUploadFile = (uri: string) => {
    const uriWithoutQuery = uri.split(/[?#]/)[0];
    const encodedFileName = uriWithoutQuery.split('/').pop() || 'upload.jpg';

    let fileName = encodedFileName;
    let path = uri.startsWith('file://') ? uri.slice('file://'.length) : uri;

    try {
        fileName = decodeURIComponent(encodedFileName);
        path = decodeURIComponent(path);
    } catch {
        // Keep the original values when the URI contains invalid escape sequences.
    }

    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';

    return {
        fileName,
        mimeType: MIME_TYPES[extension] || 'image/jpeg',
        path,
    };
};

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

                    const file = getUploadFile(uri);
                    const response = await ReactNativeBlobUtil.fetch(
                        'POST',
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        {
                            'Content-Type': 'multipart/form-data',
                        },
                        [
                            {
                                name: 'file',
                                filename: file.fileName,
                                type: file.mimeType,
                                data: ReactNativeBlobUtil.wrap(file.path),
                            },
                            {
                                name: 'upload_preset',
                                data: uploadPreset,
                            },
                        ]
                    );

                    const status = response.info().status;
                    let data: CloudinaryUploadResponse;

                    try {
                        data = response.json() as CloudinaryUploadResponse;
                    } catch {
                        return {
                            error: {
                                status,
                                data: { message: 'Cloudinary returned an invalid response' },
                            },
                        };
                    }

                    if (status < 200 || status >= 300 || !data.secure_url) {
                        return {
                            error: {
                                status,
                                data: { message: data.error?.message || 'Failed to upload image to Cloudinary' },
                            },
                        };
                    }

                    return { data: data.secure_url };
                } catch (error: any) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            data: { message: error.message || 'An error occurred during upload' },
                        },
                    };
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useUploadMutation } = uploadApi;
