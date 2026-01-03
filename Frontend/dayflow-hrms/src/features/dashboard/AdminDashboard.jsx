import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import api from '../../services/api';
import {
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todaysAttendance: 0,
    payrollProcessed: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/admin');
      setStats(response.data.stats);
      setRecentLeaves(response.data.recentLeaves);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await api.put(`/leave/${leaveId}/${action}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const statsCards = [
    { 
      name: 'Total Employees', 
      value: stats.totalEmployees, 
      icon: UsersIcon, 
      color: 'from-blue-500 to-cyan-400',
      trend: '+12%',
      description: 'Active staff'
    },
    { 
      name: 'Pending Leaves', 
      value: stats.pendingLeaves, 
      icon: DocumentTextIcon, 
      color: 'from-amber-500 to-yellow-400',
      trend: '+5',
      description: 'Awaiting approval'
    },
    { 
      name: "Today's Attendance", 
      value: `${stats.todaysAttendance}%`, 
      icon: CalendarIcon, 
      color: 'from-emerald-500 to-green-400',
      trend: '+2.5%',
      description: 'Attendance rate'
    },
    { 
      name: 'Payroll Processed', 
      value: `$${stats.payrollProcessed}K`, 
      icon: CurrencyDollarIcon, 
      color: 'from-purple-500 to-pink-400',
      trend: '+8%',
      description: 'This month'
    },
  ];

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your HR operations efficiently</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-300">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div 
            key={stat.name} 
            className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200/50 hover:border-indigo-200/50 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-gray-100 to-white rounded-xl shadow-sm">
                <stat.icon className={`w-6 h-6 ${stat.name === 'Total Employees' ? 'text-blue-600' : 
                                        stat.name === 'Pending Leaves' ? 'text-amber-600' :
                                        stat.name === 'Today\'s Attendance' ? 'text-emerald-600' :
                                        'text-purple-600'}`} />
              </div>
              <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-50 to-white px-2 py-1 rounded-lg">
                <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{stat.name}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                style={{ 
                  width: `${stat.name === 'Total Employees' ? '85%' :
                          stat.name === 'Pending Leaves' ? '40%' :
                          stat.name === 'Today\'s Attendance' ? '92%' :
                          '78%'}` 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Leaves & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leaves */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pending Leave Requests</h2>
                <p className="text-sm text-gray-600">Recent leave applications</p>
              </div>
            </div>
            <Link 
              to="/leave-approval" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="p-6">
            {recentLeaves.length > 0 ? (
              <div className="space-y-4">
                {recentLeaves.map((leave) => (
                  <div 
                    key={leave.id} 
                    className="group bg-white p-4 rounded-xl border border-gray-200/50 hover:border-indigo-200/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                          <span className="font-bold text-gray-700">
                            {leave.employeeName?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{leave.employeeName}</p>
                          <p className="text-xs text-gray-500">{leave.employeeId}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        leave.type === 'Paid' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
                        leave.type === 'Sick' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' :
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                      }`}>
                        {leave.type}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Dates</p>
                        <p className="font-medium text-gray-900">{leave.startDate} - {leave.endDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'approve')}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'reject')}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                  <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mt-4">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Frequently used actions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/attendance"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100/50 hover:border-blue-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm text-center">Manage Attendance</span>
              </Link>
              <Link
                to="/leave-approval"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-white to-amber-50 rounded-xl border border-amber-100/50 hover:border-amber-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm text-center">Approve Leaves</span>
              </Link>
              <Link
                to="/payroll"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100/50 hover:border-purple-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm text-center">Process Payroll</span>
              </Link>
              <Link
                to="/employees"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-emerald-100/50 hover:border-emerald-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-400 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm text-center">Manage Employees</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">New employee onboarded</p>
                  <p className="text-sm text-gray-500">John Doe joined as Senior Developer</p>
                </div>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;