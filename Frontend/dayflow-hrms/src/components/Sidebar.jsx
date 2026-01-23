import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import React from "react";
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const employeeMenu = [
    {
      name: "Dashboard",
      path: "/",
      icon: HomeIcon,
      color: "from-blue-500 to-cyan-400",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserIcon,
      color: "from-purple-500 to-pink-400",
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: CalendarIcon,
      color: "from-green-500 to-emerald-400",
    },
    {
      name: "Apply Leave",
      path: "/leave",
      icon: DocumentTextIcon,
      color: "from-amber-500 to-yellow-400",
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: CurrencyDollarIcon,
      color: "from-emerald-500 to-teal-400",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: ChartBarIcon,
      color: "from-red-500 to-orange-400",
    },
  ];

  const adminMenu = [
    {
      name: "Dashboard",
      path: "/",
      icon: HomeIcon,
      color: "from-blue-500 to-cyan-400",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserIcon,
      color: "from-purple-500 to-pink-400",
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: CalendarIcon,
      color: "from-green-500 to-emerald-400",
    },
    {
      name: "Leave Approval",
      path: "/leave-approval",
      icon: DocumentTextIcon,
      color: "from-amber-500 to-yellow-400",
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: CurrencyDollarIcon,
      color: "from-emerald-500 to-teal-400",
    },
   
    {
      name: "Employees",
      path: "/employees",
      icon: UsersIcon,
      color: "from-indigo-500 to-blue-400",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: CogIcon,
      color: "from-gray-600 to-gray-400",
    },
  ];

  const menuItems = user?.role === "admin" ? adminMenu : employeeMenu;

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30"
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${isMobile ? "fixed" : "sticky"} 
        top-0 h-screen z-40
        bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-xl
        shadow-2xl shadow-gray-300/30 border-r border-gray-200/50
        transition-all duration-300 ease-in-out
        ${
          isMobile
            ? mobileOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full"
            : collapsed
              ? "w-20"
              : "w-72"
        }
      `}
      >
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-white p-1.5 rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        <nav className="p-4 h-full overflow-y-auto scrollbar-thin">
          {/* Logo */}
          <div
            className={`flex items-center justify-center mb-8 transition-all duration-300 ${
              isMobile || !collapsed ? "px-4" : "px-0"
            }`}
          >
            {isMobile || collapsed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
            ) : (
              <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">D</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Dayflow HR</h3>
                    <p className="text-purple-200 text-xs">
                      {user?.role === "admin"
                        ? "Admin Panel"
                        : "Employee Portal"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => `
                    flex items-center rounded-2xl p-3 transition-all duration-300 group
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} shadow-lg shadow-current/20 text-white`
                        : "text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:text-gray-900"
                    }
                    ${isMobile || !collapsed ? "" : "justify-center"}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`relative ${isMobile || !collapsed ? "mr-3" : ""}`}
                      >
                        <item.icon
                          className={`w-6 h-6 ${isActive ? "text-white" : "text-current"}`}
                        />
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-300`}
                        ></div>
                      </div>
                      {(isMobile || !collapsed) && (
                        <span className="font-medium whitespace-nowrap overflow-hidden">
                          {item.name}
                        </span>
                      )}
                      {isActive && (isMobile || !collapsed) && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* User Info - Only shown when expanded */}
          {(isMobile || !collapsed) && (
            <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 truncate">
                    {user?.name}
                  </h4>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role} • Online
                  </p>
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
