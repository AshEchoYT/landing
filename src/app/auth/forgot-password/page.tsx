'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMessage('If an account with that email exists, we have sent you a password reset link.');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mouse Follower */}
        <motion.div
          className="fixed w-96 h-96 bg-gradient-radial from-green-500/5 to-transparent rounded-full pointer-events-none blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo/Brand Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl shadow-2xl shadow-green-500/50 mb-4 relative"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Zap className="w-8 h-8 text-black" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl opacity-0"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-500 bg-clip-text text-transparent mb-2"
            animate={{
              textShadow: [
                '0 0 20px rgba(34, 197, 94, 0.5)',
                '0 0 30px rgba(34, 197, 94, 0.8)',
                '0 0 20px rgba(34, 197, 94, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Reset Password
          </motion.h1>
          <p className="text-gray-400 text-sm">Enter your email to receive a password reset link</p>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-green-500/20 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Form Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-cyan-500/5 rounded-2xl opacity-0"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-white mb-3 font-medium text-sm">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-green-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 placeholder-gray-400"
                  placeholder="Enter your email address"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  className="text-green-400 text-center text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-400 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black py-4 rounded-xl font-bold hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  'Send Reset Link'
                )}
              </span>
            </motion.button>
          </form>

          {/* Back to Login Link */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/auth/login"
              className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 font-medium transition-colors duration-300 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-green-500/20 py-4">
          <p className="text-center text-gray-500 text-xs">
            Events.Echo - Experience the Future of Live Events
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;