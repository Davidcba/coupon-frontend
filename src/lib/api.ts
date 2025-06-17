export const api = async <T>(
    path: string,
    token: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const res = await fetch(`http://localhost:3000${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  
    if (!res.ok) {
      throw new Error('API error');
    }
  
    return res.json();
  };
  