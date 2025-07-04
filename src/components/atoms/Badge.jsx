import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon,
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-secondary text-white';
      case 'warning':
        return 'bg-warning text-white';
      case 'error':
        return 'bg-error text-white';
      case 'info':
        return 'bg-info text-white';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring':
        return 'bg-orange-100 text-orange-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-3 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const badgeClasses = `
    inline-flex items-center
    font-medium rounded-full
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {icon && (
        <ApperIcon name={icon} className="w-3 h-3 mr-1" />
      )}
      {children}
    </span>
  );
};

export default Badge;