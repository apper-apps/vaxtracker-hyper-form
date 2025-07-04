import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "../../App";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const Header = () => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/receiving':
        return 'Vaccine Receiving';
      case '/administration':
        return 'Dose Administration';
      case '/inventory':
        return 'Vaccine Inventory';
      case '/reconciliation':
        return 'Monthly Reconciliation';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        return 'VaxTracker Pro';
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium">
                {user?.firstName || user?.name || 'User'}
              </span>
              <ApperIcon name="ChevronDown" size={16} />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.emailAddress || 'user@example.com'}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <ApperIcon name="LogOut" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;