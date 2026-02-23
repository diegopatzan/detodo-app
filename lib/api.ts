const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  if (typeof window !== 'undefined') {
    return '/api'; // Browser client-side relative URL
  }
  return 'http://localhost:3000/api'; // Default for local server-side
};

export async function fetchFromApi(endpoint: string, page: number = 1, pageSize: number = 20, filters?: Record<string, string>) {
  const baseUrl = getBaseUrl();
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters, 
    });

    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}?${params.toString()}`;
    
    const res = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
        // If API fails, return empty structure to handle gracefully
        return { data: [], total: 0 };
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { data: [], total: 0 };
  }
}

export async function fetchSingleFromApi(endpoint: string, filters?: Record<string, string>) {
  const baseUrl = getBaseUrl();
  try {
    const params = new URLSearchParams(filters);
    const queryString = filters ? `?${params.toString()}` : '';

    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}${queryString}`;
    
    console.log('Fetching:', url);

    const res = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
        return null; // Handle 404 or error
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching single ${endpoint}:`, error);
    return null;
  }
}
