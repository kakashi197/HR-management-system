import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import React from 'react'
import api from '../../services/api'
import {
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todaysAttendance: 0,
    payrollProcessed: 0
  })
  const [recentLeaves, setRecentLeaves] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/admin')
      setStats(response.data.stats)
      setRecentLeaves(response.data.recentLeaves)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await api.put(`/leave/${leaveId}/${action}`)
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating leave:', error)
    }
  }

  const statsCards = [
    { name: 'Total Employees', value: stats.totalEmployees, icon: UsersIcon, color: 'bg-blue-500' },
    { name: 'Pending Leaves', value: stats.pendingLeaves, icon: DocumentTextIcon, color: 'bg-yellow-500' },
    { name: "Today's Attendance", value: stats.todaysAttendance, icon: CalendarIcon, color: 'bg-green-500' },
    { name: 'Payroll Processed', value: `$${stats.payrollProcessed}`, icon: CurrencyDollarIcon, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your HR operations efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Leaves */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h2>
          <Link to="/leave-approval" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="p-6">
          {recentLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-medium">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.type === 'Paid' ? 'bg-green-100 text-green-800' :
                          leave.type === 'Sick' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'approve')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pending leave requests</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/attendance"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="p-3 rounded-full bg-blue-500 mb-3">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Manage Attendance</span>
            </Link>
            <Link
              to="/leave-approval"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="p-3 rounded-full bg-yellow-500 mb-3">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Approve Leaves</span>
            </Link>
            <Link
              to="/payroll"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="p-3 rounded-full bg-purple-500 mb-3">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Process Payroll</span>
            </Link>
            <Link
              to="/profile"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="p-3 rounded-full bg-green-500 mb-3">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900">Manage Employees</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard