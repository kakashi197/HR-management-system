import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import React from 'react';
import { 
  ClockIcon, 
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/my', {
        params: { month: selectedDate }
      });
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setChecking(true);
      await api.post('/attendance/checkin');
      fetchAttendance();
      fetchTodayAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setChecking(true);
      await api.post('/attendance/checkout');
      fetchAttendance();
      fetchTodayAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-gradient-to-r from-emerald-500 to-green-400 text-white';
      case 'Absent': return 'bg-gradient-to-r from-rose-500 to-pink-400 text-white';
      case 'Half-day': return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      case 'Leave': return 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your daily attendance records</p>
        </div>
        
        {/* Check In/Out Button */}
        <div className="flex items-center space-x-4">
          {todayAttendance?.check_in && !todayAttendance?.check_out ? (
            <div className="text-center bg-gradient-to-r from-white to-emerald-50 p-4 rounded-2xl shadow-lg border border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Checked in at</p>
                  <p className="font-bold text-lg text-gray-900">{todayAttendance.check_in}</p>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={checking}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
              >
                {checking ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </span>
                ) : 'Check Out'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={checking || (todayAttendance?.check_in && todayAttendance?.check_out)}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center space-x-2"
            >
              {checking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-5 h-5" />
                  <span>Check In</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Present Days</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendance.filter(a => a.status === 'Present').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Working Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendance.reduce((total, record) => total + (parseFloat(record.working_hours) || 0), 0).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
              <ClockIcon className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendance.length > 0 
                  ? `${((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Filter by Month</p>
              <p className="text-sm text-gray-600">Select a month to view attendance records</p>
            </div>
          </div>
          <input
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900">Attendance History</h2>
          <p className="text-gray-600 mt-1">Monthly attendance records and details</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading attendance records...</p>
            </div>
          ) : attendance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendance.map((record) => (
                <div 
                  key={record.id} 
                  className="group bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200/50 hover:border-indigo-200/50 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200/50">
                      <p className="text-xs text-gray-500 mb-1">Check In</p>
                      <p className="font-bold text-gray-900">{record.check_in || '--:--'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200/50">
                      <p className="text-xs text-gray-500 mb-1">Check Out</p>
                      <p className="font-bold text-gray-900">{record.check_out || '--:--'}</p>
                    </div>
                  </div>
                  
                  {record.working_hours && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100/50">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-indigo-900">Working Hours</p>
                        <p className="font-bold text-lg text-indigo-600">{record.working_hours} hrs</p>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (parseFloat(record.working_hours) / 8) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No records found</h3>
              <p className="text-gray-500 mt-2">No attendance records available for selected month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;