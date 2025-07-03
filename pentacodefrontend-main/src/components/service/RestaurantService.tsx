import axios from 'axios';
import { Restaurant } from '../../types/NewRestaurant';

const API_BASE_URL = 'http://localhost:8080/api/restaurant';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchRestaurants = async (
  searchQuery: string = '',
  sortOption: string = 'name-asc'
): Promise<Restaurant[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all`, {
      headers: getAuthHeaders(),
      params: {
        search: searchQuery,
        sort: sortOption,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to fetch restaurants');
  }
};