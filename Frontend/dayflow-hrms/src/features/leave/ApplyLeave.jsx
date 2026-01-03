import { useState, useEffect } from 'react';
import api from '../../services/api';
import React from 'react';
import {
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    type: 'Paid',
    startDate: '',
    endDate: '',
    remarks: ''
  });
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({
    paid: 15,
    sick: 10,
    unpaid: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leave');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/leave/balance');
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post('/leave', formData);
      setFormData({
        type: 'Paid',
        startDate: '',
        endDate: '',
        remarks: ''
      });
      fetchLeaves();
      fetchLeaveBalance();
      alert('Leave application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
      case 'Paid': return 'from-blue-500 to-cyan-400';
      case 'Sick': return 'from-emerald-500 to-green-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const leaveTypes = [
    { type: 'Paid', balance: balance.paid, color: 'from-blue-500 to-cyan-400', icon: CheckCircleIcon, description: 'Annual vacation leave' },
    { type: 'Sick', balance: balance.sick, color: 'from-emerald-500 to-green-400', icon: ClockIcon, description: 'Medical leave' },
    { type: 'Unpaid', balance: balance.unpaid, color: 'from-gray-500 to-gray-400', icon: XCircleIcon, description: 'Leave without pay' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Apply for Leave
        </h1>
        <p className="text-gray-600 mt-2">Submit your leave request for approval</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Balance */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Leave Balance</h2>
            <div className="space-y-4">
              {leaveTypes.map((item) => (
                <div 
                  key={item.type}
                  className={`bg-gradient-to-br from-white to-${item.type === 'Paid' ? 'blue' : item.type === 'Sick' ? 'emerald' : 'gray'}-50 p-4 rounded-xl border border-${item.type === 'Paid' ? 'blue' : item.type === 'Sick' ? 'emerald' : 'gray'}-100/50`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${item.color} rounded-lg`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.type} Leave</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.balance}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${Math.min(100, (item.balance / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Calendar */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Upcoming Leaves</h3>
                <p className="text-sm text-gray-500">Scheduled time off</p>
              </div>
            </div>
            <div className="space-y-3">
              {leaves.slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{leave.type}</p>
                    <p className="text-sm text-gray-500">{leave.startDate} - {leave.endDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Form & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Form */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Leave Application</h2>
                  <p className="text-sm text-gray-500">Fill in the details below</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                  >
                    <option value="Paid">Paid Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Days
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{calculateDays()} days</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                  placeholder="Please provide reason for leave..."
                />
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Submit Leave Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Leave History */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
                  <p className="text-sm text-gray-500">Previous leave applications</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {leaves.length > 0 ? (
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${getTypeColor(leave.type)} text-white`}>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                    <CalendarIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mt-4">No leave applications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;