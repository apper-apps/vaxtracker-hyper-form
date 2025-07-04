import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

const navigationItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/receiving', label: 'Receiving', icon: 'PackageCheck' },
    { path: '/administration', label: 'Administration', icon: 'Syringe' },
    { path: '/reconciliation', label: 'Reconciliation', icon: 'Calculator' },
    { path: '/inventory', label: 'Inventory', icon: 'Package' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
    { path: '/settings', label: 'Settings', icon: 'Settings' }
  ];

  const NavItem = ({ item, isMobile = false }) => (
    <NavLink
      to={item.path}
      onClick={isMobile ? onClose : undefined}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
        }`
      }
    >
      <ApperIcon name={item.icon} className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Shield" className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold gradient-text">VaxTracker</h1>
              <p className="text-sm text-gray-500">Pro</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary to-green-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Healthcare Admin</p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <ApperIcon name="Shield" className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold gradient-text">VaxTracker</h1>
                    <p className="text-sm text-gray-500">Pro</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => (
                  <NavItem key={item.path} item={item} isMobile={true} />
                ))}
              </nav>

              {/* Mobile Footer */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary to-green-600 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Healthcare Admin</p>
                    <p className="text-xs text-gray-500">System Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;