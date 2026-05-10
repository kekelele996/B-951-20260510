import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/tasks', label: '任务列表', icon: '📋' },
    { path: '/performance', label: '绩效统计', icon: '📊' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/users', label: '用户管理', icon: '👥' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-24 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur border-b border-white/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/tasks" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">任务绩效管理</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-white/70 shadow-sm ring-1 ring-black/5 text-gray-900'
                      : 'text-gray-600 hover:bg-white/60 hover:shadow-sm hover:ring-1 hover:ring-black/5 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/70 ring-1 ring-black/5 shadow-sm rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? '管理员' : '普通用户'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white/40 hover:bg-white/70 ring-1 ring-black/5 rounded-lg transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-white/70 shadow-sm ring-1 ring-black/5 text-gray-900'
                  : 'text-gray-600 bg-white/30 ring-1 ring-black/5'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
