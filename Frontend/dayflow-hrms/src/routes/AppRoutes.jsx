import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import EmployeeDashboard from '../features/dashboard/EmployeeDashboard';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import Profile from '../features/profile/Profile';
import Attendance from '../features/attendance/Attendance';
import ApplyLeave from '../features/leave/ApplyLeave';
import LeaveApproval from '../features/leave/LeaveApproval';
import Payroll from '../features/payroll/Payroll';
import React from 'react';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dayflow HRMS...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <PrivateRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      
      <Route path="/attendance" element={
        <PrivateRoute>
          <Attendance />
        </PrivateRoute>
      } />
      
      <Route path="/leave" element={
        <PrivateRoute>
          <ApplyLeave />
        </PrivateRoute>
      } />
      
      <Route path="/leave-approval" element={
        <PrivateRoute allowedRoles={['admin']}>
          <LeaveApproval />
        </PrivateRoute>
      } />
      
      <Route path="/payroll" element={
        <PrivateRoute>
          <Payroll />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;