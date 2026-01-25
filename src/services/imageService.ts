interface UnsplashSearchResponse {
  results: Array<{
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    width: number;
    height: number;
  }>;
  total: number;
  total_pages: number;
}

const imageCache = new Map<string, string | null>();

export const getLocationImage = async (
  location: string,
  options?: { width?: number; height?: number }
): Promise<string | null> => {
  if (!location || !location.trim()) {
    return null;
  }

  const cacheKey = `${location}-${options?.width || 'default'}-${options?.height || 'default'}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) ?? null;
  }

  const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    imageCache.set(cacheKey, null);
    return null;
  }

  try {
    const query = encodeURIComponent(location.trim());
    const width = options?.width || 800;
    const height = options?.height || 400;
    
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('Unsplash API key is invalid or missing');
      }
      imageCache.set(cacheKey, null);
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      imageCache.set(cacheKey, null);
      return null;
    }

    const image = data.results[0];
    let imageUrl = image.urls.regular;
    
    if (options?.width || options?.height) {
      imageUrl = `${image.urls.raw}&w=${width}&h=${height}&fit=crop`;
    }

    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching location image:', error);
    imageCache.set(cacheKey, null);
    return null;
  }
};
