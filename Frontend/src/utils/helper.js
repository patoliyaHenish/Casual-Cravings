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