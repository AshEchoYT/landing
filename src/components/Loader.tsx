import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <motion.div
        className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default Loader;