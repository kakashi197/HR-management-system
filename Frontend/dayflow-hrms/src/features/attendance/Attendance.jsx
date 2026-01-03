import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import React from 'react'

const Attendance = () => {
  const { user } = useContext(AuthContext)
  const [attendance, setAttendance] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState('daily') // 'daily' or 'weekly'
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')

  useEffect(() => {
    fetchAttendance()
    checkTodayAttendance()
  }, [selectedDate, view])

  const fetchAttendance = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/attendance/all' : '/attendance'
      const params = view === 'weekly' ? { week: getWeekNumber(new Date(selectedDate)) } : { date: selectedDate }
      const response = await api.get(endpoint, { params })
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const checkTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get(`/attendance/check?date=${today}`)
      setIsCheckedIn(response.data.checkedIn)
      setCheckInTime(response.data.checkInTime)
    } catch (error) {
      console.error('Error checking attendance:', error)
    }
  }

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin')
      setIsCheckedIn(true)
      setCheckInTime(new Date().toLocaleTimeString())
      fetchAttendance()
    } catch (error) {
      console.error('Error checking in:', error)
    }
  }

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout')
      setIsCheckedIn(false)
      fetchAttendance()
    } catch (error) {
      console.error('Error checking out:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      case 'Half-day': return 'bg-yellow-100 text-yellow-800'
      case 'Leave': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'View and manage all employee attendance' : 'Track your daily attendance'}
          </p>
        </div>
        
        {user?.role === 'employee' && (
          <div className="flex items-center space-x-4">
            {isCheckedIn ? (
              <div className="text-center">
                <p className="text-sm text-gray-600">Checked in at</p>
                <p className="font-semibold">{checkInTime}</p>
                <button
                  onClick={handleCheckOut}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Check Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
              >
                Check In
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('daily')}
              className={`px-4 py-2 rounded-md ${view === 'daily' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Daily View
            </button>
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-md ${view === 'weekly' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Weekly View
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {user?.role === 'admin' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-medium">
                              {record.employeeName?.charAt(0) || 'E'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.employeeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkIn || '--:--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOut || '--:--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workingHours || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendance.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{formatDate(record.date)}</p>
                      <p className="text-sm text-gray-600">{record.day}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check In</p>
                      <p className="font-medium">{record.checkIn || '--:--'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check Out</p>
                      <p className="font-medium">{record.checkOut || '--:--'}</p>
                    </div>
                  </div>
                  {record.remarks && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-sm">{record.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {user?.role === 'employee' && attendance.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {attendance.filter(a => a.status === 'Present').length}
              </p>
              <p className="text-sm text-gray-600">Present Days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {attendance.filter(a => a.status === 'Absent').length}
              </p>
              <p className="text-sm text-gray-600">Absent Days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {attendance.filter(a => a.status === 'Half-day').length}
              </p>
              <p className="text-sm text-gray-600">Half Days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {attendance.filter(a => a.status === 'Leave').length}
              </p>
              <p className="text-sm text-gray-600">Leave Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance