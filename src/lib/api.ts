export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
