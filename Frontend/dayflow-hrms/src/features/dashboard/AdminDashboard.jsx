import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import React from 'react';
import {
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BellIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/admin');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      if (action === 'approve') {
        await api.put(`/leave/${leaveId}/approve`);
      } else {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
          await api.put(`/leave/${leaveId}/reject`, { reason });
        }
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating leave:', error);
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

  const statsCards = [
    { 
      name: 'Total Employees', 
      value: dashboardData?.stats?.totalEmployees || 0, 
      icon: UsersIcon, 
      color: 'from-blue-500 to-cyan-400',
      description: 'Active employees',
      link: '/employees'
    },
    { 
      name: 'Pending Leaves', 
      value: dashboardData?.stats?.pendingLeaves || 0, 
      icon: DocumentTextIcon, 
      color: 'from-amber-500 to-yellow-400',
      description: 'Awaiting approval',
      link: '/leave-approval'
    },
    { 
      name: "Today's Attendance", 
      value: `${dashboardData?.stats?.todaysAttendance || 0} / ${dashboardData?.stats?.totalEmployees || 0}`, 
      icon: CalendarIcon, 
      color: 'from-emerald-500 to-green-400',
      description: 'Present today',
      link: '/attendance'
    },
    { 
      name: 'Unread Notifications', 
      value: dashboardData?.stats?.unreadNotifications || 0, 
      icon: BellIcon, 
      color: 'from-purple-500 to-pink-400',
      description: 'Require attention',
      link: '#'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Here's your overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Today's Date</p>
            <p className="font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Link 
            key={stat.name} 
            to={stat.link}
            className="group block"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200/50 hover:border-indigo-200/50 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-gray-100 to-white rounded-xl shadow-sm">
                  <stat.icon className={`w-6 h-6 ${stat.name === 'Total Employees' ? 'text-blue-600' : 
                                          stat.name === 'Pending Leaves' ? 'text-amber-600' :
                                          stat.name === 'Today\'s Attendance' ? 'text-emerald-600' :
                                          'text-purple-600'}`} />
                </div>
                <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-50 to-white px-2 py-1 rounded-lg">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">+12%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{stat.name}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${activeTab === 'employees' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${activeTab === 'leaves' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Leaves
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Attendance
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Pending Leaves */}
        {activeTab === 'overview' && (
          <>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Pending Leave Requests</h2>
                    <p className="text-sm text-gray-600">Require immediate attention</p>
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
                {dashboardData?.recentLeaves && dashboardData.recentLeaves.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentLeaves.map((leave) => (
                      <div 
                        key={leave.id} 
                        className="group bg-white p-4 rounded-xl border border-gray-200/50 hover:border-indigo-200/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                              <span className="font-bold text-gray-700">
                                {leave.employee_name?.charAt(0) || 'E'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{leave.employee_name}</p>
                              <p className="text-xs text-gray-500">{leave.employee_id} • {leave.department}</p>
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
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Dates</p>
                            <p className="font-medium text-gray-900">
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium text-gray-900">{leave.days} days</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLeaveAction(leave.id, 'approve')}
                              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave.id, 'reject')}
                              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
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

            {/* Recent Employees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                      <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Recent Employees</h2>
                      <p className="text-sm text-gray-600">Newly joined staff</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {dashboardData?.recentRegistrations && dashboardData.recentRegistrations.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentRegistrations.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                              <span className="font-bold text-gray-700">
                                {employee.name?.charAt(0) || 'E'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              <p className="text-xs text-gray-500">{employee.employee_id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(employee.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent employees</p>
                  )}
                </div>
              </div>

              {/* Department Stats */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Department Overview</h2>
                      <p className="text-sm text-gray-600">Employee distribution</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {dashboardData?.departmentStats && dashboardData.departmentStats.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.departmentStats.map((dept) => (
                        <div key={dept.department} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                            <span className="text-sm font-medium text-gray-900">{dept.count} employees</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                              style={{ width: `${(dept.count / dashboardData.stats.totalEmployees) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No department data</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">All Employees</h2>
                    <p className="text-sm text-gray-600">Manage your team members</p>
                  </div>
                </div>
                <Link 
                  to="/employees" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  View All Employees
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData?.recentRegistrations?.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                              <span className="font-bold text-gray-700">
                                {employee.name?.charAt(0) || 'E'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department || 'Not assigned'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position || 'Not assigned'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-green-400 text-white">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/employee/${employee.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Today's Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Today's Attendance</h2>
                    <p className="text-sm text-gray-600">{dashboardData?.todayDate || new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {dashboardData?.stats?.todaysAttendance || 0} / {dashboardData?.stats?.totalEmployees || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.todayAttendance && dashboardData.todayAttendance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.todayAttendance.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                            <span className="font-bold text-gray-700">
                              {record.name?.charAt(0) || 'E'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.name}</p>
                            <p className="text-xs text-gray-500">{record.department}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          record.status === 'Present' ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' :
                          record.status === 'Absent' ? 'bg-gradient-to-r from-rose-500 to-pink-400 text-white' :
                          record.status === 'Half-day' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white' :
                          'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Check In</p>
                          <p className="font-medium text-gray-900">{record.check_in || '--:--'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Check Out</p>
                          <p className="font-medium text-gray-900">{record.check_out || '--:--'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                    <ClockIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mt-4">No attendance records for today</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;