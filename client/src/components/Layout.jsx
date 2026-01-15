import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Clock, User, Link as LinkIcon, Moon, Sun, Monitor, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Event Types', icon: LinkIcon },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/availability', label: 'Availability', icon: Clock },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cal.clone</h1>
        <button onClick={toggleMobileMenu} className="text-gray-600 dark:text-gray-300">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cal.clone</h1>
        </div>
        
        {/* Mobile Header inside Sidebar (optional, for consistency if needed) */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 md:hidden flex justify-between items-center">
           <h1 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h1>
           <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300">
             <X className="w-6 h-6" />
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Theme Toggle */}
        <div className="px-4 py-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-1 rounded-md flex justify-center ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
            >
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 p-1 rounded-md flex justify-center ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
            >
              <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-1 rounded-md flex justify-center ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
            >
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
