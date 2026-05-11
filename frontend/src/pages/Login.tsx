import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useToastContext } from '../components/Toast';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('请填写用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success('登录成功');
      navigate('/tasks');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-24 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-200/25 blur-3xl" />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">任务绩效管理系统</h1>
          <p className="text-gray-500 mt-2">登录您的账号</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-white/60 ring-1 ring-black/5 p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/60 ring-1 ring-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-shadow"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 border border-white/60 ring-1 ring-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-shadow"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-2.5 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-600">
          还没有账号？{' '}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
