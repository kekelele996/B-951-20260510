import { useState, useEffect } from 'react';
import { performanceApi } from '../api';
import { useToastContext } from '../components/Toast';
import type { PerformanceStats, RankingItem } from '../types';

export function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, rankingRes] = await Promise.all([
        performanceApi.getStats(),
        performanceApi.getRanking(),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (rankingRes.data) setRanking(rankingRes.data);
    } catch (err) {
      toast.error('加载绩效数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">绩效统计</h1>
        <p className="text-gray-500 mt-1">查看您的任务绩效和团队排名</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">本月绩效</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.current_month_score?.toFixed(1) || '0.0'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">本月任务</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.current_month_tasks || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总任务数</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.total_tasks || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">平均评分</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.average_score?.toFixed(1) || '0.0'}
            <span className="text-lg text-gray-400">/5</span>
          </p>
        </div>
      </div>

      {/* Monthly Trend */}
      {stats?.monthly_trend && stats.monthly_trend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">月度趋势</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.monthly_trend.map((item, index) => {
              const maxScore = Math.max(...stats.monthly_trend.map(t => t.score || 1));
              const height = ((item.score || 0) / maxScore) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gray-900 rounded-t"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-400 mt-2">
                    {item.month}月
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">绩效排行榜</h2>
        {ranking.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无排行数据</p>
        ) : (
          <div className="space-y-3">
            {ranking.map((item) => (
              <div
                key={item.rank}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  item.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  item.rank === 2 ? 'bg-gray-100 text-gray-700' :
                  item.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {item.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.user.username}</p>
                  <p className="text-xs text-gray-500">{item.task_count} 个任务</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{item.score.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">绩效分</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
