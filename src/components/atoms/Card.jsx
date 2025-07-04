import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default',
  hoverable = false,
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'card-elevated';
      case 'gradient':
        return 'bg-gradient-to-br from-primary to-secondary text-white shadow-elevated';
      case 'success':
        return 'bg-gradient-to-br from-secondary to-green-600 text-white shadow-elevated';
      case 'warning':
        return 'bg-gradient-to-br from-warning to-orange-600 text-white shadow-elevated';
      case 'error':
        return 'bg-gradient-to-br from-error to-red-600 text-white shadow-elevated';
      default:
        return 'card';
    }
  };

  const cardClasses = `
    ${getVariantClasses()}
    ${hoverable ? 'hover-lift cursor-pointer' : ''}
    ${className}
  `;

  if (hoverable) {
    return (
      <motion.div
        className={cardClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;