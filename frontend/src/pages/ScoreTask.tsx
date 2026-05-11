import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasksApi } from '../api';
import { useToastContext } from '../components/Toast';

export function ScoreTaskPage() {
  const { id } = useParams<{ id: string }>();
  const [score, setScore] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    setLoading(true);
    try {
      await tasksApi.score(parseInt(id), { score, comment: comment.trim() || undefined });
      toast.success('评分成功');
      navigate('/tasks');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '评分失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">任务评分</h1>
        <p className="text-gray-500 mt-1">为已完成的任务评定绩效分数</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              评分 (1-5 星)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className={`w-12 h-12 rounded-lg text-2xl transition-all ${
                    score >= value
                      ? 'bg-yellow-100 text-yellow-500'
                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              当前评分: <span className="font-medium">{score} 星</span>
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1.5">
              评语（可选）
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="请输入评语..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '提交中...' : '提交评分'}
          </button>
        </div>
      </form>
    </div>
  );
}
