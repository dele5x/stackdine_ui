




import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faUtensils,
  faReceipt,
  faCalendarDays,
  faUser,
  faRightFromBracket,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { label: 'Home',         path: '/customer/home',         icon: faHouse },
  { label: 'Menu',         path: '/customer/menu',         icon: faUtensils },
  { label: 'My Orders',    path: '/customer/orders',       icon: faReceipt },
  { label: 'Reservations', path: '/customer/reservations', icon: faCalendarDays },
  { label: 'Payments',     path: '/customer/payments',     icon: faCreditCard },
  { label: 'Profile',      path: '/customer/profile',      icon: faUser },

];

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top navbar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-orange-500 font-bold text-xl">StackDine</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              Hey, {user?.name?.split(' ')[0]}!
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-sm transition"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 md:hidden">
        <div className="w-full mx-auto px-1">
          {/* Changed from flex to an explicit 6-column grid layout */}
          <div className="grid grid-cols-6 items-center justify-items-center py-2 gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-1 w-full rounded-lg transition min-w-0 ${
                    isActive ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="text-base sm:text-lg" />
                {/* Optimized tracking and added truncation boundaries */}
                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center tracking-tight px-0.5 block">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom padding so content doesn't hide behind nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default CustomerLayout;