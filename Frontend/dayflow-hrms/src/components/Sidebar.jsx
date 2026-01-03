import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { NavLink } from 'react-router-dom'
import React from 'react'
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { user } = useContext(AuthContext)

  const employeeMenu = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Attendance', path: '/attendance', icon: CalendarIcon },
    { name: 'Apply Leave', path: '/leave', icon: DocumentTextIcon },
    { name: 'Payroll', path: '/payroll', icon: CurrencyDollarIcon },
  ]

  const adminMenu = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Attendance', path: '/attendance', icon: CalendarIcon },
    { name: 'Leave Approval', path: '/leave-approval', icon: DocumentTextIcon },
    { name: 'Payroll', path: '/payroll', icon: CurrencyDollarIcon },
    { name: 'Settings', path: '/settings', icon: CogIcon },
  ]

  const menuItems = user?.role === 'admin' ? adminMenu : employeeMenu

  return (
    <aside className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar