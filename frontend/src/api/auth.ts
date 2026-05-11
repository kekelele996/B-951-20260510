import api from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse,
} from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),
    
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),
    
  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout', {}),
    
  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};

export default authApi;
