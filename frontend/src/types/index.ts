// User type definition
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Task type definitions
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'scored';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  performance_weight: number;
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  score?: TaskScore;
}

// Task score type definition
export interface TaskScore {
  id: number;
  task_id: number;
  scorer_id: number;
  score: number;
  comment?: string;
  created_at: string;
  scorer?: User;
}

// Performance type definition
export interface Performance {
  id: number;
  user_id: number;
  year: number;
  month: number;
  total_score: number;
  task_count: number;
  calculated_at: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Task request types
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  performance_weight: number;
  due_date: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
}

export interface ScoreTaskRequest {
  score: number;
  comment?: string;
}

// Performance stats
export interface PerformanceStats {
  current_month_score: number;
  current_month_tasks: number;
  total_tasks: number;
  average_score: number;
  monthly_trend: MonthlyPerformance[];
}

export interface MonthlyPerformance {
  year: number;
  month: number;
  score: number;
  task_count: number;
}

export interface RankingItem {
  rank: number;
  user: User;
  score: number;
  task_count: number;
}
