import api from './client';
import type { ApiResponse, PerformanceStats, RankingItem } from '../types';

export const performanceApi = {
  getStats: () =>
    api.get<ApiResponse<PerformanceStats>>('/performance'),
    
  getRanking: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set('year', year.toString());
    if (month) params.set('month', month.toString());
    const query = params.toString();
    return api.get<ApiResponse<RankingItem[]>>(`/performance/rank${query ? '?' + query : ''}`);
  },
};

export default performanceApi;
