import axios from 'axios';

const API_URL = 'http://localhost:8081/api/users';

export const getUsers = () => {
  return axios.get(API_URL);
};

export const getUserById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const createUser = (user) => {
  return axios.post(API_URL, user);
};

export const updateUser = (id, user) => {
  return axios.put(`${API_URL}/${id}`, user);
};

export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};