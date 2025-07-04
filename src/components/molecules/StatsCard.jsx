import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  variant = 'default',
  onClick,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-secondary';
    if (trend === 'down') return 'text-error';
    return 'text-gray-500';
  };

  return (
    <Card 
      variant={variant} 
      hoverable={!!onClick}
      onClick={onClick}
      className={`p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'error'
            ? 'bg-white bg-opacity-20'
            : 'bg-gradient-to-br from-primary to-secondary'
        }`}>
          <ApperIcon 
            name={icon} 
            className={`w-6 h-6 ${
              variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'error'
                ? 'text-white'
                : 'text-white'
            }`} 
          />
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <ApperIcon name={getTrendIcon()} className="w-4 h-4" />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <motion.div 
          className={`text-3xl font-bold ${
            variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'error'
              ? 'text-white'
              : 'gradient-text'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {value}
        </motion.div>
        
        <p className={`text-sm font-medium ${
          variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'error'
            ? 'text-white text-opacity-90'
            : 'text-gray-600'
        }`}>
          {title}
        </p>
      </div>
    </Card>
  );
};

export default StatsCard;