import axios from 'axios';

const API_BASE_URL = '/api/users';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getUsers = async () => {
  const response = await api.get('');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await api.post('', user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
