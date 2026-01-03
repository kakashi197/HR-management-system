import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import React from 'react';
import {
  UserCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  PhoneIcon,
  HomeIcon,
  CalendarIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    emergencyContact: '',
    skills: '',
    department: '',
    position: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      // Set user data from AuthContext
      setProfile(prev => ({
        ...prev,
        ...user,
        employeeId: user.employeeId || user.id || 'N/A',
        name: user.name || 'Unknown User',
        email: user.email || 'N/A',
        role: user.role || 'employee'
      }));
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const profileData = response.data;
      
      // Merge with user data from context
      setProfile({
        ...profileData,
        ...user,
        employeeId: user?.employeeId || profileData.employeeId || user?.id || 'N/A',
        name: user?.name || profileData.name || 'Unknown User',
        email: user?.email || profileData.email || 'N/A',
        role: user?.role || profileData.role || 'employee'
      });
      
      setFormData({
        address: profileData.address || '',
        phone: profileData.phone || '',
        emergencyContact: profileData.emergencyContact || '',
        skills: Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '',
        department: profileData.department || '',
        position: profileData.position || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        maritalStatus: profileData.maritalStatus || '',
        bloodGroup: profileData.bloodGroup || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use user data from context if API fails
      setProfile({
        ...user,
        employeeId: user?.employeeId || user?.id || 'N/A',
        name: user?.name || 'Unknown User',
        email: user?.email || 'N/A',
        role: user?.role || 'employee',
        department: 'Not assigned',
        position: 'Not assigned',
        joinDate: 'Not available',
        address: 'Not provided',
        phone: 'Not provided',
        emergencyContact: 'Not provided'
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      await api.put('/profile', submitData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) {
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
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden mb-8">
        <div className="p-8 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-white to-purple-200 rounded-2xl shadow-2xl flex items-center justify-center">
                  <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30"></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm capitalize">
                    {profile.role}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                    {profile.department || 'Department'}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                    #{profile.employeeId}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-purple-100">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{profile.position || 'Position'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-100">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Joined {profile.joinDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-100">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{profile.phone || 'Phone'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                {user?.role === 'employee' && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                )}
                <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-300">
                  Download CV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <HomeIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Address
                      </div>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Phone Number
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Emergency Contact
                      </div>
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                      placeholder="Emergency contact person"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Skills (comma separated)
                      </div>
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:border-indigo-300"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <IdentificationIcon className="w-4 h-4 mr-2" />
                        Employee ID
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.employeeId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <UserCircleIcon className="w-4 h-4 mr-2" />
                        Full Name
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        Email Address
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        Phone Number
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Address
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.address || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                        Department
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.department || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-2" />
                        Position
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.position || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Join Date
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.joinDate || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Emergency Contact
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl">
                      {profile.emergencyContact || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <div className="flex items-center">
                        <UserCircleIcon className="w-4 h-4 mr-2" />
                        User Role
                      </div>
                    </label>
                    <p className="text-lg font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl capitalize">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl font-medium border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet. Add skills in edit mode.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Documents & Additional Info */}
        <div className="space-y-8">
          {/* Documents Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Documents</h3>
                <p className="text-sm text-gray-500">Important files & certificates</p>
              </div>
            </div>
            <div className="space-y-4">
              {profile.documents && Array.isArray(profile.documents) && profile.documents.length > 0 ? (
                profile.documents.map((doc, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {doc.name || `Document ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">{doc.size || 'Unknown size'}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto flex items-center justify-center">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mt-4">No documents available</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-2xl shadow-emerald-200/30 border border-emerald-100/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Stats</h3>
            <div className="space-y-4">
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

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl shadow-indigo-200/30 border border-indigo-100/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-left">
                Request Certificate
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-left">
                Update Bank Details
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 border border-amber-100 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-left">
                View Pay Slips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;