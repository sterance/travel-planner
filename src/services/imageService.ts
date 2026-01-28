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
  console.log("[imageService] getLocationImage called", {
    location,
    options,
  });

  if (!location || !location.trim()) {
    console.log("[imageService] no location provided, returning null");
    return null;
  }

  const cacheKey = `${location}-${options?.width || 'default'}-${options?.height || 'default'}`;
  
  if (imageCache.has(cacheKey)) {
    console.log("[imageService] returning cached image url", {
      cacheKey,
      hasCachedValue: true,
      cachedValueIsNull: imageCache.get(cacheKey) == null,
    });
    return imageCache.get(cacheKey) ?? null;
  }

  const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  console.log("[imageService] unsplash api key info", {
    hasKey: Boolean(apiKey),
    keyLength: apiKey?.length ?? 0,
    keyPreview: apiKey ? `${apiKey.slice(0, 6)}...` : null,
  });

  if (!apiKey) {
    console.warn("[imageService] missing VITE_UNSPLASH_ACCESS_KEY, caching null result", {
      cacheKey,
    });
    imageCache.set(cacheKey, null);
    return null;
  }

  try {
    const query = encodeURIComponent(location.trim());
    const width = options?.width || 800;
    const height = options?.height || 400;
    
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${apiKey}`;
    console.log("[imageService] fetching unsplash image", {
      url,
      query,
      width,
      height,
    });

    const response = await fetch(url);
    console.log("[imageService] unsplash response received", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn("[imageService] unsplash api key is invalid or unauthorized", {
          status: response.status,
          statusText: response.statusText,
        });
      }
      console.warn("[imageService] unsplash request failed, caching null result", {
        cacheKey,
      });
      imageCache.set(cacheKey, null);
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log("[imageService] unsplash returned no results", {
        query,
        total: data.total,
      });
      imageCache.set(cacheKey, null);
      return null;
    }

    const image = data.results[0];
    let imageUrl = image.urls.regular;
    
    if (options?.width || options?.height) {
      imageUrl = `${image.urls.raw}&w=${width}&h=${height}&fit=crop`;
    }

    console.log("[imageService] resolved image url", {
      cacheKey,
      imageId: image.id,
      imageUrl,
    });

    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("[imageService] error fetching location image", {
      location,
      options,
      error,
    });
    imageCache.set(cacheKey, null);
    return null;
  }
};
