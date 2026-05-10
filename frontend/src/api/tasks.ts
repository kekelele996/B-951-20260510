import api from './client';
import type {
  Task,
  ApiResponse,
  PaginatedResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ScoreTaskRequest,
  TaskStatus,
} from '../types';

export const tasksApi = {
  list: (params?: { status?: TaskStatus; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Task>>(`/tasks${query ? '?' + query : ''}`);
  },
  
  get: (id: number) =>
    api.get<ApiResponse<Task>>(`/tasks/${id}`),
    
  create: (data: CreateTaskRequest) =>
    api.post<ApiResponse<Task>>('/tasks', data),
    
  update: (id: number, data: UpdateTaskRequest) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
    
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/tasks/${id}`),
    
  updateStatus: (id: number, status: TaskStatus) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),
    
  score: (id: number, data: ScoreTaskRequest) =>
    api.post<ApiResponse<Task>>(`/tasks/${id}/score`, data),
};

export default tasksApi;
