import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import React from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarIcon,
  PhoneIcon,
  HomeIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    attendance: {},
    leaves: {}
  });

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/employee/${id}`);
      setEmployee(response.data.employee);
      setDocuments(response.data.documents || []);
      setStats(response.data.summary || {});
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/users/employee/${id}`);
        navigate('/employees');
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
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

  if (!employee) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Employee not found</h3>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'attendance', name: 'Attendance', icon: ClockIcon },
    { id: 'leaves', name: 'Leaves', icon: CalendarIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {employee.name}
            </h1>
            <p className="text-gray-600 mt-2">Employee ID: {employee.employee_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center space-x-2">
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 rounded-xl border border-rose-100 hover:shadow-md transition-all duration-300 flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Deactivate</span>
          </button>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-white to-purple-200 rounded-2xl shadow-2xl flex items-center justify-center">
                <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {employee.name?.charAt(0) || 'E'}
                </span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30"></div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm capitalize">
                  {employee.department || 'Department'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                  {employee.position || 'Position'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  employee.is_active 
                    ? 'bg-emerald-500/20 text-emerald-200' 
                    : 'bg-rose-500/20 text-rose-200'
                }`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-purple-100">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-100">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{employee.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-100">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {new Date(employee.join_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="font-medium text-gray-900">{employee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="font-medium text-gray-900">{employee.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
                  <p className="font-medium text-gray-900">{employee.emergency_contact || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
                  <p className="font-medium text-gray-900">{employee.employee_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <p className="font-medium text-gray-900">{employee.department || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Position</label>
                  <p className="font-medium text-gray-900">{employee.position || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Join Date</label>
                  <p className="font-medium text-gray-900">
                    {new Date(employee.join_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    employee.is_active 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white'
                      : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white'
                  }`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Summary</h3>
            {stats.attendance ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <p className="text-sm text-gray-500 mb-2">Present Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendance.present_days || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-rose-50 p-5 rounded-xl border border-rose-100">
                  <p className="text-sm text-gray-500 mb-2">Absent Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendance.absent_days || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-amber-50 p-5 rounded-xl border border-amber-100">
                  <p className="text-sm text-gray-500 mb-2">Half Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendance.half_days || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-500 mb-2">Avg Working Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parseFloat(stats.attendance.avg_working_hours || 0).toFixed(1)} hrs
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No attendance data available</p>
            )}
          </div>
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Leave Summary</h3>
            {stats.leaves ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-500 mb-2">Total Leaves</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.leaves.total_leaves || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <p className="text-sm text-gray-500 mb-2">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.leaves.approved_leaves || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-amber-50 p-5 rounded-xl border border-amber-100">
                  <p className="text-sm text-gray-500 mb-2">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.leaves.pending_leaves || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-rose-50 p-5 rounded-xl border border-rose-100">
                  <p className="text-sm text-gray-500 mb-2">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.leaves.rejected_leaves || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No leave data available</p>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Documents</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                Upload Document
              </button>
            </div>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{doc.document_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-indigo-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                  <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mt-4">No documents uploaded</p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                    <span className="text-sm font-bold text-emerald-600">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Task Completion</span>
                    <span className="text-sm font-bold text-emerald-600">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Productivity</span>
                    <span className="text-sm font-bold text-emerald-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;