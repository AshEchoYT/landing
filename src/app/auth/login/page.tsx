'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/events');
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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
        {/* Back Button */}
        <motion.button
          onClick={() => window.location.href = '/'}
          className="absolute top-4 left-4 flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-300 z-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>

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
              rotate: [0, 5],
              scale: [1, 1.1]
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
            Welcome Back
          </motion.h1>
          <p className="text-gray-400 text-sm">Sign in to your Events.Echo account</p>
        </motion.div>

        {/* Login Form */}
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
                  placeholder="Enter your email"
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

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-white mb-3 font-medium text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-700/50 border border-green-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

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

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black py-4 rounded-xl font-bold hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
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
                  'Sign In'
                )}
              </span>
            </motion.button>

            {/* Create Account Button */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <span className="text-gray-400 text-sm">Don't have an account?</span>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold rounded-lg hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 cursor-pointer"
              >
                Create one here
              </button>
            </div>
          </form>
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

export default LoginPage;