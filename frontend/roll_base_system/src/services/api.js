// src/services/api.js
const API_BASE_URL = 'http://localhost:5000'; // Swap with your actual backend URL

export async function fetchPaginatedData(endpoint, page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Expecting the shape: { data: [], meta: { currentPage, perPage, count } }
    return await response.json(); 
  } catch (error) {
    console.error(`Failed fetching from ${endpoint}:`, error);
    throw error;
  }
}
