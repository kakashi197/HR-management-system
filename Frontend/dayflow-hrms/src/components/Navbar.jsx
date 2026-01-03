import { useContext } from 'react';
import React from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-purple-200 rounded-xl shadow-lg flex items-center justify-center transform hover:rotate-12 transition-all duration-300">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  D
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition"></div>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white drop-shadow-lg">Dayflow HRMS</span>
              <p className="text-xs text-purple-200">Human Resource Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {user && (
              <>
                <button className="relative p-2 text-white/90 hover:text-white transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                </button>
                
                <div className="flex items-center space-x-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-white to-blue-100 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <span className="font-bold text-lg text-blue-600">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition"></div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center">
                      <p className="font-medium text-white text-sm">{user.name}</p>
                    </div>
                    <p className="text-xs text-purple-200/80 capitalize">{user.role} Account</p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Logout</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;