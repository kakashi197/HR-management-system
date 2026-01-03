import { useState, useEffect } from 'react';
import api from '../../services/api';
import React from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchLeaves();
    calculateStats();
  }, [filter]);

  useEffect(() => {
    calculateStats();
  }, [leaves]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leave/admin?status=${filter}`);
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    setStats({ pending, approved, rejected });
  };

  const handleAction = async (leaveId, action) => {
    try {
      await api.put(`/leave/${leaveId}/${action}`);
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-gradient-to-r from-emerald-500 to-green-400 text-white';
      case 'Rejected': return 'bg-gradient-to-r from-rose-500 to-pink-400 text-white';
      default: return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Paid': return 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white';
      case 'Sick': return 'bg-gradient-to-r from-emerald-500 to-green-400 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    }
  };

  const filterTabs = [
    { key: 'pending', label: 'Pending', icon: ClockIcon, count: stats.pending, color: 'from-amber-500 to-yellow-400' },
    { key: 'approved', label: 'Approved', icon: CheckCircleIcon, count: stats.approved, color: 'from-emerald-500 to-green-400' },
    { key: 'rejected', label: 'Rejected', icon: XCircleIcon, count: stats.rejected, color: 'from-rose-500 to-pink-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Leave Approval
        </h1>
        <p className="text-gray-600 mt-2">Review and approve employee leave requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filterTabs.map((tab) => (
          <div 
            key={tab.key} 
            className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border transition-all duration-500 hover:-translate-y-1 ${
              filter === tab.key 
                ? 'shadow-indigo-200/50 border-indigo-200/50' 
                : 'shadow-gray-200/50 border-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${tab.color}`}>
                <tab.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${tab.color} bg-clip-text text-transparent`}>
                {tab.count}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{tab.label} Requests</p>
              <p className="text-xs text-gray-500 mt-1">Leave applications</p>
            </div>
            <button
              onClick={() => setFilter(tab.key)}
              className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === tab.key ? 'Viewing' : 'View'} {tab.label}
            </button>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
        <div className="border-b border-gray-200/50">
          <nav className="flex">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 capitalize transition-all duration-300 ${
                  filter === tab.key
                    ? `border-b-2 bg-gradient-to-r ${tab.color} bg-clip-text text-transparent border-current`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className={`w-4 h-4 ${filter === tab.key ? `text-${tab.key === 'pending' ? 'amber' : tab.key === 'approved' ? 'emerald' : 'rose'}-500` : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Leaves Table */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading leave requests...</p>
            </div>
          ) : leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                            <span className="font-bold text-gray-700">
                              {leave.employeeName?.charAt(0) || 'E'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.employeeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getTypeColor(leave.type)}`}>
                          {leave.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.days} days
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                        <p className="truncate">{leave.remarks || 'No remarks'}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {leave.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(leave.id, 'approve')}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(leave.id, 'reject')}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-400 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all duration-300"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No leaves found</h3>
              <p className="text-gray-500 mt-2">
                There are no {filter} leave requests at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl shadow-amber-200/30 border border-amber-100/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Pending Analysis</h3>
              <p className="text-sm text-gray-500">Requires immediate attention</p>
            </div>
          </div>
          <div className="space-y-3">
            {leaves
              .filter(l => l.status === 'Pending')
              .slice(0, 3)
              .map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{leave.employeeName}</span>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">{leave.days} days</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl shadow-indigo-200/30 border border-indigo-100/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500">Batch processing</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full p-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
              Approve All Pending
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;