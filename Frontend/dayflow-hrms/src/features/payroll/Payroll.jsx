import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import React from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const Payroll = () => {
  const { user } = useContext(AuthContext);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    average: 0,
    employees: 0
  });

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'admin' ? '/payroll/all' : '/payroll';
      const response = await api.get(endpoint, { params: { month: selectedMonth } });
      setPayrolls(response.data.payrolls || []);
      setSummary(response.data.summary || { total: 0, average: 0, employees: 0 });
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNetSalary = (salary) => {
    const basic = salary.basic || 0;
    const allowances = salary.allowances || 0;
    const deductions = salary.deductions || 0;
    const bonus = salary.bonus || 0;
    return basic + allowances + bonus - deductions;
  };

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-gradient-to-r from-emerald-500 to-green-400 text-white';
      case 'Pending': return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      case 'Failed': return 'bg-gradient-to-r from-rose-500 to-pink-400 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'admin' ? 'View and manage employee payroll' : 'View your salary details'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          {user?.role === 'admin' && (
            <button className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
              Process Payroll
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.total)}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">+12.5% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Average Salary</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.average)}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">+5.2% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.employees}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
                <BanknotesIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-rose-600">-2 from last month</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' ? (
        /* Admin Payroll View */
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900">Employee Payroll</h2>
            <p className="text-gray-600 mt-1">Manage salaries and payments</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading payroll data...</p>
              </div>
            ) : payrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Basic Salary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allowances
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bonus
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Salary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payrolls.map((payroll) => {
                      const netSalary = calculateNetSalary(payroll);
                      return (
                        <tr key={payroll.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                                <span className="font-bold text-gray-700">
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
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payroll.basic || 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            + {formatCurrency(payroll.allowances || 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-rose-600 font-medium">
                            - {formatCurrency(payroll.deductions || 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                            + {formatCurrency(payroll.bonus || 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(netSalary)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(payroll.status)}`}>
                              {payroll.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </button>
                              <button className="text-emerald-600 hover:text-emerald-900">
                                Mark Paid
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                  <CurrencyDollarIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No payroll data</h3>
                <p className="text-gray-500 mt-2">
                  No payroll records found for the selected month.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Employee Payroll View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Salary Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                    <BanknotesIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Salary Details</h2>
                    <p className="text-sm text-gray-500">Monthly salary breakdown</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {payrolls.length > 0 ? (
                  <div className="space-y-8">
                    {payrolls.map((payroll) => {
                      const netSalary = calculateNetSalary(payroll);
                      return (
                        <div key={payroll.id} className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-blue-100">
                              <p className="text-sm text-gray-500 mb-2">Basic Salary</p>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payroll.basic || 0)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100">
                              <p className="text-sm text-gray-500 mb-2">Allowances</p>
                              <p className="text-2xl font-bold text-emerald-600">
                                + {formatCurrency(payroll.allowances || 0)}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-rose-50 p-5 rounded-xl border border-rose-100">
                              <p className="text-sm text-gray-500 mb-2">Deductions</p>
                              <p className="text-2xl font-bold text-rose-600">
                                - {formatCurrency(payroll.deductions || 0)}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100">
                              <p className="text-sm text-gray-500 mb-2">Bonus</p>
                              <p className="text-2xl font-bold text-emerald-600">
                                + {formatCurrency(payroll.bonus || 0)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <p className="text-lg font-bold text-gray-900">Net Salary</p>
                                <p className="text-sm text-gray-600">After all adjustments</p>
                              </div>
                              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(netSalary)}
                              </p>
                            </div>
                            <div className="w-full bg-indigo-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (netSalary / 10000) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-3">Payment Status</p>
                            <div className="flex items-center justify-between">
                              <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(payroll.status)}`}>
                                {payroll.status}
                              </span>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Payment Date</p>
                                <p className="font-medium text-gray-900">{payroll.paymentDate || '--/--/----'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                      <CurrencyDollarIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mt-4">No payroll data available for the selected month.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Salary Slips */}
          <div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                    <DocumentArrowDownIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Salary Slips</h2>
                    <p className="text-sm text-gray-500">Previous month slips</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {months.slice(0, 6).map((month) => (
                    <div 
                      key={month} 
                      className="group flex items-center justify-between p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500">Salary Slip PDF</p>
                      </div>
                      <button className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 rounded-lg hover:shadow-md transition-all duration-300">
                        <DocumentArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tax Summary */}
            <div className="mt-6 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl shadow-amber-200/30 border border-amber-100/50 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tax Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Income Tax</span>
                  <span className="font-medium text-gray-900">$1,250.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Social Security</span>
                  <span className="font-medium text-gray-900">$450.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Health Insurance</span>
                  <span className="font-medium text-gray-900">$180.00</span>
                </div>
                <div className="pt-3 border-t border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Deductions</span>
                    <span className="font-bold text-rose-600">$1,880.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;