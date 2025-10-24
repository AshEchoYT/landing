"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, User, LogOut, Ticket, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/events', label: 'Events', icon: Zap },
    ...(user ? [{ href: '/tickets', label: 'My Tickets', icon: Ticket }] : []),
    ...(user?.role === 'organizer' ? [{ href: '/organizer', label: 'Dashboard', icon: BarChart3 }] : []),
  ];

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-green-500/30 shadow-lg shadow-green-500/10'
          : 'bg-black/60 backdrop-blur-md border-b border-green-500/20'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/50">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-20 blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Events.Echo
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:text-green-400 transition-all duration-300 relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      layoutId={`nav-bg-${item.href}`}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            {/* Auth Section */}
            <div className="ml-6 pl-6 border-l border-green-500/20">
              {user ? (
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="flex items-center space-x-2 text-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </motion.div>
                  <motion.button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Link href="/auth/login">
                      <motion.button
                        className="px-4 py-2 rounded-lg text-white hover:text-green-400 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </motion.button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link href="/auth/register">
                      <motion.button
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:text-green-400 transition-colors duration-300"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-green-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-green-500/20">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-3 text-white">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-black" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <motion.button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
                        whileHover={{ scale: 1.02, x: 10 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <User className="w-5 h-5" />
                        <span>Login</span>
                      </motion.div>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.button
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                        whileHover={{ scale: 1.02, x: 10, boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <User className="w-5 h-5" />
                        <span>Sign Up</span>
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;