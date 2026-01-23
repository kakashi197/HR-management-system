import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import React from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const LeaveApproval = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkReason, setBulkReason] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leave/all?status=${filter}`);
      setLeaves(response.data.leaves || []);
      setStats(response.data.stats || { pending: 0, approved: 0, rejected: 0 });
      setSelectedLeaves([]); // Clear selections on filter change
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leaveId, action) => {
    try {
      if (action === 'approve') {
        await api.put(`/leave/${leaveId}/approve`);
      } else {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
          await api.put(`/leave/${leaveId}/reject`, { reason });
        } else {
          return; // User cancelled
        }
      }
      fetchLeaves(); // Refresh the list
      alert(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating leave:', error);
      alert(error.response?.data?.message || 'Error processing leave request');
    }
  };

  const handleBulkAction = async () => {
    if (selectedLeaves.length === 0) {
      alert('Please select leaves to process');
      return;
    }

    if (!bulkAction) {
      alert('Please select an action (Approve or Reject)');
      return;
    }

    if (bulkAction === 'reject' && !bulkReason.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    try {
      await api.put('/leave/bulk-action', {
        leaveIds: selectedLeaves,
        action: bulkAction,
        reason: bulkReason
      });
      
      alert(`${selectedLeaves.length} leaves ${bulkAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      fetchLeaves(); // Refresh the list
      setSelectedLeaves([]);
      setBulkAction('');
      setBulkReason('');
    } catch (error) {
      console.error('Error processing bulk action:', error);
      alert(error.response?.data?.message || 'Error processing bulk action');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pendingLeaves = filteredLeaves.filter(leave => leave.status === 'Pending');
      setSelectedLeaves(pendingLeaves.map(leave => leave.id));
    } else {
      setSelectedLeaves([]);
    }
  };

  const handleSelectLeave = (leaveId) => {
    if (selectedLeaves.includes(leaveId)) {
      setSelectedLeaves(selectedLeaves.filter(id => id !== leaveId));
    } else {
      setSelectedLeaves([...selectedLeaves, leaveId]);
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

  const filteredLeaves = leaves.filter(leave => {
    if (!searchTerm) return true;
    return (
      leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

      {/* Bulk Actions Bar */}
      {filter === 'pending' && selectedLeaves.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Bulk Actions</h3>
              <p className="text-sm text-gray-600">{selectedLeaves.length} leaves selected</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 flex-1 md:justify-end">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve All</option>
                <option value="reject">Reject All</option>
              </select>
              
              {bulkAction === 'reject' && (
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Enter rejection reason"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction === 'reject' && !bulkReason.trim())}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50"
              >
                Apply Bulk Action
              </button>
              
              <button
                onClick={() => setSelectedLeaves([])}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium border border-gray-300"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={fetchLeaves}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'pending' ? 'Pending Leave Requests' : 
             filter === 'approved' ? 'Approved Leaves' : 'Rejected Leaves'}
          </h2>
          <p className="text-gray-600 mt-1">{filteredLeaves.length} requests found</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading leave requests...</p>
            </div>
          ) : filteredLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {filter === 'pending' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedLeaves.length > 0 && selectedLeaves.length === filteredLeaves.filter(l => l.status === 'Pending').length}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                    )}
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
                    {filter === 'pending' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      {filter === 'pending' && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedLeaves.includes(leave.id)}
                            onChange={() => handleSelectLeave(leave.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
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
                              {leave.employeeId} • {leave.department}
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
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
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
                      {filter === 'pending' && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
                        </td>
                      )}
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
                {filter === 'pending' 
                  ? 'There are no pending leave requests at the moment.'
                  : `There are no ${filter} leave requests at the moment.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;