import axios from 'axios';
import { Menu } from '../../types/Menu';

const API_BASE_URL = 'http://localhost:8080/api/menu';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMenus = async (
  searchQuery: string = '',
  filterCategory: string = '',
  filterType: string = '',
  sortOption: string = 'name-asc'
): Promise<Menu[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurant`, {
      headers: getAuthHeaders(),
      params: {
        search: searchQuery,
        category: filterCategory,
        type: filterType,
        sort: sortOption,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to fetch menus');
  }
};

export const createMenu = async (menu: Omit<Menu, 'pk'>): Promise<Menu> => {
  try {
    const response = await axios.post(API_BASE_URL, menu, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to create menu');
  }
};

export const updateMenu = async (pk: number, menu: Omit<Menu, 'pk'>): Promise<Menu> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${pk}`, menu, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to update menu');
  }
};

export const deleteMenu = async (pk: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${pk}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error('Failed to delete menu');
  }
};