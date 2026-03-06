/**
 * Service for uploading images to imgbb
 */

const IMGBB_API_KEY = process.env.IMGBB_API || '';

export const uploadToImgBB = async (uri: string): Promise<string> => {
  if (!IMGBB_API_KEY) {
    throw new Error('imgbb API key is missing');
  }

  const formData = new FormData();
  
  // For React Native, we need to create a file object for FormData
  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];

  formData.append('image', {
    uri,
    name: `photo.${fileType}`,
    type: `image/${fileType}`,
  } as any);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to imgbb');
    }
  } catch (error) {
    console.error('imgbb upload error:', error);
    throw error;
  }
};
