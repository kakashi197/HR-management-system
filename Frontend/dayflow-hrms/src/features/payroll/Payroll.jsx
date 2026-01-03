import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import React from 'react'

const Payroll = () => {
  const { user } = useContext(AuthContext)
  const [payrolls, setPayrolls] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPayrolls()
  }, [selectedMonth])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const endpoint = user?.role === 'admin' ? '/payroll/all' : '/payroll'
      const response = await api.get(endpoint, { params: { month: selectedMonth } })
      setPayrolls(response.data)
    } catch (error) {
      console.error('Error fetching payrolls:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateNetSalary = (salary) => {
    const basic = salary.basic || 0
    const allowances = salary.allowances || 0
    const deductions = salary.deductions || 0
    const bonus = salary.bonus || 0
    return basic + allowances + bonus - deductions
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'View and manage employee payroll' : 'View your salary details'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {user?.role === 'admin' ? (
        /* Admin Payroll View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payroll data...</p>
              </div>
            ) : payrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Basic Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allowances
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bonus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Salary
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
                    {payrolls.map((payroll) => {
                      const netSalary = calculateNetSalary(payroll)
                      return (
                        <tr key={payroll.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="font-medium">
                                  {payroll.employeeName?.charAt(0) || 'E'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payroll.employeeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payroll.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payroll.basic || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payroll.allowances || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payroll.deductions || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payroll.bonus || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(netSalary)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payroll.status === 'Paid' 
                                ? 'bg-green-100 text-green-800'
                                : payroll.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payroll.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              Edit
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              Mark Paid
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payroll records found for the selected month.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Employee Payroll View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salary Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Salary Details</h2>
              </div>
              <div className="p-6">
                {payrolls.length > 0 ? (
                  <div className="space-y-6">
                    {payrolls.map((payroll) => {
                      const netSalary = calculateNetSalary(payroll)
                      return (
                        <div key={payroll.id} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Basic Salary</p>
                              <p className="text-lg font-semibold">{formatCurrency(payroll.basic || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Allowances</p>
                              <p className="text-lg font-semibold text-green-600">
                                + {formatCurrency(payroll.allowances || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Deductions</p>
                              <p className="text-lg font-semibold text-red-600">
                                - {formatCurrency(payroll.deductions || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bonus</p>
                              <p className="text-lg font-semibold text-green-600">
                                + {formatCurrency(payroll.bonus || 0)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <p className="text-lg font-bold text-gray-900">Net Salary</p>
                              <p className="text-2xl font-bold text-primary-600">
                                {formatCurrency(netSalary)}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Payment Status</p>
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                payroll.status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payroll.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                Payment Date: {payroll.paymentDate || '--/--/----'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payroll data available for the selected month.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Salary Slips */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Salary Slips</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {months.slice(0, 6).map((month) => (
                    <div key={month} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500">Salary Slip</p>
                      </div>
                      <button className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll