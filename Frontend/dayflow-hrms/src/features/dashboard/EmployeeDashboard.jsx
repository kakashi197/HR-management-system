import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import React from 'react';
import api from '../../services/api';
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    attendance: 0,
    leaveRequests: 0,
    upcomingLeaves: 0,
    todayStatus: 'Not Marked'
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/employee');
      setStats(response.data.stats);
      setRecentLeaves(response.data.recentLeaves || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { name: 'View Profile', path: '/profile', icon: UserIcon, color: 'from-blue-500 to-cyan-400' },
    { name: 'Mark Attendance', path: '/attendance', icon: CalendarIcon, color: 'from-emerald-500 to-green-400' },
    { name: 'Apply Leave', path: '/leave', icon: DocumentTextIcon, color: 'from-amber-500 to-yellow-400' },
    { name: 'View Salary', path: '/payroll', icon: CurrencyDollarIcon, color: 'from-purple-500 to-pink-400' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'from-emerald-500 to-green-400';
      case 'Absent': return 'from-rose-500 to-pink-400';
      case 'Half-day': return 'from-amber-500 to-yellow-400';
      case 'Leave': return 'from-blue-500 to-cyan-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden">
        <div className="p-8 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-yellow-300">{user?.name}!</span>
            </h1>
            <p className="text-purple-100 mt-2">Here's your overview for today</p>
            <div className="mt-6 flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm">#{user?.employeeId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-200/30 border border-blue-100/50 hover:border-blue-200/50 transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">+5%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stats.attendance} days</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Attendance This Month</p>
            <p className="text-xs text-gray-500 mt-1">Regular attendance days</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-amber-200/30 border border-amber-100/50 hover:border-amber-200/50 transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl">
              <DocumentTextIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-rose-600">+2</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats.leaveRequests}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Pending Leaves</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/30 border border-emerald-100/50 hover:border-emerald-200/50 transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
              <ClockIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(stats.todayStatus)} text-white text-xs font-bold`}>
              {stats.todayStatus}
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors capitalize">{stats.todayStatus}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Today's Status</p>
            <p className="text-xs text-gray-500 mt-1">Current attendance status</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-200/30 border border-purple-100/50 hover:border-purple-200/50 transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">+3</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{stats.upcomingLeaves}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Upcoming Leaves</p>
            <p className="text-xs text-gray-500 mt-1">Scheduled leaves</p>
          </div>
        </div>
      </div>

      {/* Quick Access & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
                  <p className="text-sm text-gray-600">Frequently used actions</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/50 hover:border-indigo-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${link.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm text-center">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl shadow-purple-200/30 border border-indigo-100/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <ClockIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Working Hours</p>
                  <p className="text-sm text-gray-600">8 hours scheduled</p>
                </div>
              </div>
              <span className="font-bold text-indigo-600">7.5h</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tasks Completed</p>
                  <p className="text-sm text-gray-600">Daily tasks</p>
                </div>
              </div>
              <span className="font-bold text-emerald-600">12/15</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Meetings</p>
                  <p className="text-sm text-gray-600">Scheduled meetings</p>
                </div>
              </div>
              <span className="font-bold text-amber-600">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leaves */}
      {recentLeaves.length > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Leave Applications</h2>
                  <p className="text-sm text-gray-600">Your recent leave requests</p>
                </div>
              </div>
              <Link 
                to="/leave" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          leave.type === 'Paid' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
                          leave.type === 'Sick' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        }`}>
                          {leave.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.days} days
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          leave.status === 'Approved' ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' :
                          leave.status === 'Rejected' ? 'bg-gradient-to-r from-rose-500 to-pink-400 text-white' :
                          'bg-gradient-to-r from-amber-500 to-yellow-400 text-white'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;