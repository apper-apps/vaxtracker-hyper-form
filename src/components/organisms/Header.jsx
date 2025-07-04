import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';

const Header = ({ onMenuClick, title }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon="Menu"
              onClick={onMenuClick}
              className="lg:hidden"
            />
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Time Display */}
            <div className="hidden md:block text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500">
                Live Time
              </div>
            </div>

            {/* Alert Indicator */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon="Bell"
                className="relative"
              />
              <Badge 
                variant="error" 
                size="sm"
                className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center"
              >
                3
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon="Download"
              >
                Export
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                icon="Plus"
              >
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;