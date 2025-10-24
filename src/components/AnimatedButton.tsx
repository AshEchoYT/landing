import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'glow' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const baseClasses = `${sizeClasses[size]} rounded-lg font-semibold transition-all duration-300 relative overflow-hidden group`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:from-green-400 hover:to-cyan-400 shadow-lg hover:shadow-green-500/50';
      case 'secondary':
        return 'bg-gray-700/50 backdrop-blur-sm text-white hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50';
      case 'glow':
        return 'bg-black/50 backdrop-blur-sm text-green-400 border border-green-500/50 hover:border-green-400/80 shadow-lg hover:shadow-green-500/30';
      case 'outline':
        return 'bg-transparent text-green-400 border-2 border-green-500/50 hover:border-green-400 hover:bg-green-500/10';
      default:
        return 'bg-green-500 text-black hover:bg-green-400';
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-lg border border-green-400/0 group-hover:border-green-400/50"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Micro animation particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            initial={{
              x: '50%',
              y: '50%',
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
        ))}
      </motion.div>
    </motion.button>
  );
};

export default AnimatedButton;