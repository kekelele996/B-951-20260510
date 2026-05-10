import api from './client';
import type { ApiResponse, User } from '../types';

export interface UserWithPerformance extends User {
  current_month_score: number;
  current_month_tasks: number;
  total_task_count: number;
  completed_task_count: number;
  average_score: number;
}

export const adminApi = {
  listUsers: (role?: 'admin' | 'user') => {
    const params = role ? `?role=${role}` : '';
    return api.get<ApiResponse<UserWithPerformance[]>>(`/admin/users${params}`);
  },

  updateUserStatus: (id: number, isActive: boolean) =>
    api.put<ApiResponse<null>>(`/admin/users/${id}/status`, { is_active: isActive }),
};

export default adminApi;
