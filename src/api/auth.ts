import axios from 'axios';
import { LoginData, AuthResponse } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL;

export const loginApi = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_BASE}/auth/login`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const cekLogin = async (isToken: string) => {

  const response = await axios.get(`${API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${isToken}`,
    },
  });
  return response;

};

