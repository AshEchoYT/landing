import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Star, Zap } from 'lucide-react';

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    className="absolute"
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, delay }: { icon: any; value: string; label: string; delay: number }) => (
  <motion.div
    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-150 group hover:scale-[1.03] transform will-change-transform"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)' }}
  >
    <motion.div
      className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-100 ease-out will-change-transform"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="w-6 h-6 text-black" />
    </motion.div>
    <motion.h3
      className="text-3xl font-bold text-white mb-2"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5, delay: delay + 0.2 }}
    >
      {value}
    </motion.h3>
    <p className="text-gray-400">{label}</p>
  </motion.div>
);

export const StatsSection = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            Join the <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">Future</span> of Events
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're revolutionizing how people discover, experience, and create live events with cutting-edge technology.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard icon={Users} value="50K+" label="Active Users" delay={0} />
          <StatCard icon={Calendar} value="1000+" label="Events Hosted" delay={0.1} />
          <StatCard icon={Star} value="4.9" label="Average Rating" delay={0.2} />
          <StatCard icon={Zap} value="99.9%" label="Uptime" delay={0.3} />
        </div>
      </div>
    </section>
  );
};