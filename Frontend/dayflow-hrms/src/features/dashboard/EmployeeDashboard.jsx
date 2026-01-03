import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import React from 'react'
import api from '../../services/api'
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    attendance: 0,
    leaveRequests: 0,
    upcomingLeaves: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/employee')
      setStats(response.data.stats)
      setRecentActivity(response.data.recentActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const quickLinks = [
    { name: 'View Profile', path: '/profile', icon: UserIcon, color: 'bg-blue-500' },
    { name: 'Mark Attendance', path: '/attendance', icon: CalendarIcon, color: 'bg-green-500' },
    { name: 'Apply Leave', path: '/leave', icon: DocumentTextIcon, color: 'bg-yellow-500' },
    { name: 'View Salary', path: '/payroll', icon: CurrencyDollarIcon, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.attendance} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Leave Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.leaveRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Leaves</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingLeaves}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className={`p-3 rounded-full ${link.color} mb-3`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <ul className="space-y-4">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard