import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import React from 'react';
import {
  UsersIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon, // Changed from SearchIcon
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ArrowDownTrayIcon // Changed from DocumentDownloadIcon
} from '@heroicons/react/24/outline';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/employees');
      setEmployees(response.data.employees || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/users/employee/${id}`);
        fetchEmployees(); // Refresh the list
        alert('Employee deactivated successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to deactivate employee');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees to deactivate');
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate ${selectedEmployees.length} employee(s)?`)) {
      try {
        // Delete each selected employee
        for (const id of selectedEmployees) {
          await api.delete(`/users/employee/${id}`);
        }
        fetchEmployees(); // Refresh the list
        setSelectedEmployees([]);
        alert(`${selectedEmployees.length} employee(s) deactivated successfully`);
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Failed to deactivate employees');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && employee.is_active) ||
      (statusFilter === 'inactive' && !employee.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Employee ID', 'Name', 'Email', 'Department', 'Position', 'Phone', 'Status', 'Join Date'];
    const csvData = currentEmployees.map(emp => [
      emp.id,
      emp.employee_id,
      emp.name,
      emp.email,
      emp.department || 'Not assigned',
      emp.position || 'Not assigned',
      emp.phone || 'Not provided',
      emp.is_active ? 'Active' : 'Inactive',
      new Date(emp.join_date).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all employees in your organization</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchEmployees}
            className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/employee/add')}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 flex items-center space-x-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
              <UserGroupIcon className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" 
              style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inactive || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl">
              <UsersIcon className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Deactivated accounts</p>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.departments || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active departments</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEmployees.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{selectedEmployees.length} employee(s) selected</p>
              <p className="text-sm text-gray-600">Perform bulk actions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all duration-300"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => setSelectedEmployees([])}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium border border-gray-300"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="department">Sort by Department</option>
            <option value="position">Sort by Position</option>
            <option value="join_date">Sort by Join Date</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee List</h2>
              <p className="text-gray-600 mt-1">
                {filteredEmployees.length} employees found • Showing {currentEmployees.length} of {filteredEmployees.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Employee</span>
                      <span className="text-xs">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('employee_id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      <span className="text-xs">{getSortIcon('employee_id')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Department</span>
                      <span className="text-xs">{getSortIcon('department')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Position</span>
                      <span className="text-xs">{getSortIcon('position')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('join_date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Join Date</span>
                      <span className="text-xs">{getSortIcon('join_date')}</span>
                    </div>
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
                {currentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-white rounded-lg flex items-center justify-center">
                          <span className="font-bold text-gray-700">
                            {employee.name?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employee_id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department || 'Not assigned'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position || 'Not assigned'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        employee.is_active 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link 
                          to={`/employee/${employee.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button 
                          className="text-amber-600 hover:text-amber-900 p-1"
                          title="Edit"
                          onClick={() => navigate(`/employee/edit/${employee.id}`)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.id)}
                          className="text-rose-600 hover:text-rose-900 p-1"
                          title="Deactivate"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {currentEmployees.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center">
                <UsersIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setStatusFilter('');
                }}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Summary */}
      {departments.length > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Department Summary</h2>
              <p className="text-sm text-gray-500">Employee distribution by department</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept);
              const activeEmployees = deptEmployees.filter(e => e.is_active).length;
              
              return (
                <div key={dept} className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{dept}</p>
                      <p className="text-sm text-gray-500">{deptEmployees.length} employees</p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                      <UserGroupIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                      style={{ width: `${(activeEmployees / deptEmployees.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{activeEmployees} active</span>
                    <span>{deptEmployees.length - activeEmployees} inactive</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;