import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import React from 'react'

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout