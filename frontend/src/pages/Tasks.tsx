import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api';
import { useToastContext } from '../components/Toast';
import { useAuth } from '../hooks';
import type { Task, TaskStatus } from '../types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待办', color: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-50' },
  scored: { label: '已评分', color: 'text-purple-600', bg: 'bg-purple-50' },
};

const PRIORITY_CONFIG = {
  low: { label: '低', color: 'text-gray-500' },
  medium: { label: '中', color: 'text-yellow-600' },
  high: { label: '高', color: 'text-red-600' },
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const toast = useToastContext();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await tasksApi.list(params);
      setTasks(res.data);
    } catch (err) {
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(task.id, newStatus);
      toast.success('状态更新成功');
      loadTasks();
    } catch (err) {
      toast.error('状态更新失败');
    }
  };

  const handleDelete = (id: number) => {
    toast.warning('确定要删除这个任务吗？', {
      duration: 5000,
      action: {
        label: '删除',
        onClick: async () => {
          try {
            await tasksApi.delete(id);
            toast.success('删除成功');
            loadTasks();
          } catch (err) {
            toast.error('删除失败');
          }
        },
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务列表</h1>
          <p className="text-gray-500 mt-1">管理您的所有任务和绩效</p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition"
        >
          <span className="mr-2">+</span>
          新建任务
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: '全部' },
          { value: 'pending', label: '待办' },
          { value: 'in_progress', label: '进行中' },
          { value: 'completed', label: '已完成' },
          { value: 'scored', label: '已评分' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as TaskStatus | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === value
                ? 'bg-white/80 text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'bg-white/50 text-gray-600 ring-1 ring-black/5 hover:bg-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white/70 backdrop-blur rounded-2xl border border-white/60 ring-1 ring-black/5 shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <p className="text-gray-500">暂无任务</p>
          <Link
            to="/tasks/new"
            className="inline-block mt-4 px-4 py-2 text-sm text-gray-900 font-medium hover:underline"
          >
            创建第一个任务
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white/70 backdrop-blur rounded-xl border border-white/60 ring-1 ring-black/5 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].color}`}>
                      {STATUS_CONFIG[task.status].label}
                    </span>
                    <span className={`text-xs font-medium ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}优先级
                    </span>
                    <span className="text-xs text-gray-400">
                      权重: {task.performance_weight}
                    </span>
                  </div>
                  <div
                    // to={`/tasks/${task.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>截止: {new Date(task.due_date).toLocaleDateString()}</span>
                    {task.score && (
                      <span className="text-yellow-500">
                        ⭐ {task.score.score}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(task, 'in_progress')}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      开始
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(task, 'completed')}
                      className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      完成
                    </button>
                  )}
                  {task.status === 'completed' && isAdmin && (
                    <Link
                      to={`/tasks/${task.id}/score`}
                      className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      评分
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
