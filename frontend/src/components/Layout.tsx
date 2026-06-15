import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  Star
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize Dark Mode classes on launch
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Compile role-specific navigation items
  const getNavItems = () => {
    if (!user) return [];
    
    const items = [];
    if (user.role === 'ADMIN') {
      items.push(
        { label: 'Admin Center', path: '/admin-dashboard', icon: LayoutDashboard }
      );
    } else if (user.role === 'STORE_OWNER') {
      items.push(
        { label: 'Store Dashboard', path: '/owner-dashboard', icon: LayoutDashboard }
      );
    } else if (user.role === 'USER') {
      items.push(
        { label: 'Explore Stores', path: '/user-dashboard', icon: Store }
      );
    }
    
    items.push({ label: 'My Profile', path: '/profile', icon: UserIcon });
    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-950 text-dark-50 transition-colors duration-300">
      {/* Sidebar for desktop devices */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-900/40 border-r border-dark-800/60 backdrop-blur-md sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
            <Star className="h-6 w-6 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight text-white m-0 leading-tight">RateLocal</h1>
            <span className="text-[10px] text-dark-300 uppercase tracking-widest font-semibold">Store Ratings</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="pt-6 border-t border-dark-800/40 space-y-3">
          {/* User profile brief card */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white uppercase text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate m-0">{user.name}</p>
                <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Theme & Logout action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 flex items-center justify-center p-2.5 rounded-xl border border-dark-800/80 bg-dark-900/20 hover:bg-dark-800/60 text-dark-300 hover:text-white transition-all duration-200"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center p-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header for mobile devices */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-dark-900/40 border-b border-dark-800/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-brand-500 fill-current" />
          <span className="font-bold text-white tracking-tight text-sm">RateLocal</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border border-dark-800/80 bg-dark-900/20 text-dark-300 hover:text-white"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-dark-800/80 bg-dark-900/20 text-dark-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Navigation overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-dark-950/90 backdrop-blur-md flex flex-col justify-between p-6 pt-24 animate-bounce-in">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-brand-600 text-white'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/40'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-dark-800/40 space-y-4">
            {user && (
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white uppercase text-base">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white m-0">{user.name}</p>
                  <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
