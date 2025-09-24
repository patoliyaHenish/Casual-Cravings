export async function isValidYouTubeVideo(url) {
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
  if (!ytRegex.test(url)) return false;

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);
    return response.ok;
  } catch {
    return false;
  }
}

export function getYouTubeThumbnail(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

export async function getYouTubeVideoTitle(url) {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);
    if (response.ok) {
      const data = await response.json();
      return data.title;
    }
  } catch {
    return null;
  }
  return null;
}

export function convertBase64ToImageUrl(fileStorageData) {
  if (!fileStorageData || !fileStorageData.image_data || !fileStorageData.mime_type) return '';
  
  try {
    const imageData = fileStorageData.image_data;
    const mimeType = fileStorageData.mime_type;

    if (imageData.type === 'Buffer' && Array.isArray(imageData.data)) {
      const uint8Array = new Uint8Array(imageData.data);
      const chunkSize = 8192;
      let binaryString = '';

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, chunk);
      }

      const base64String = btoa(binaryString);
      return `data:${mimeType};base64,${base64String}`;
    }

    if (typeof imageData === 'string') {
      return `data:${mimeType};base64,${imageData}`;
    }
  } catch (error) {
    return '';
  }
}

export function convertImageFileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
      const result = e.target.result;
      const base64String = result.split(',')[1];
      resolve({
        filename: file.name,
        mime_type: file.type,
        image_data: base64String
      });
    };
    
    reader.onerror = function(error) {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

export function getImageUrl(data, type) {
  if (!data) return '';
  
  let fileStorageData;
  
  if (type === 'banner') {
    fileStorageData = {
      image_data: data.image_data,
      mime_type: data.image_mime_type
    };
  } else {
    fileStorageData = {
      image_data: data.image_data,
      mime_type: data.image_mime_type
    };
  }
  
  return convertBase64ToImageUrl(fileStorageData);
}
