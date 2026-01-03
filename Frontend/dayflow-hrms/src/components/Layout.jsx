import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import React from 'react';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 lg:p-8 p-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 p-6 lg:p-8 border border-white/40">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;