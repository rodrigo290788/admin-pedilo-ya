// utils/uploadImageToImgur.js
import axios from 'axios';

const IMGUR_CLIENT_ID = 'ac85a3aee6d5bf5';

export const uploadImageToImgur = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file); // file es un File o Blob directamente

    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return response.data.data.link;
    } else {
      throw new Error('Error al subir la imagen a Imgur');
    }
  } catch (error) {
    console.error('Error en la subida a Imgur:', error);
    return null;
  }
};
