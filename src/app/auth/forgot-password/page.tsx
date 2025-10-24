'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      setMessage('If an account with that email exists, we have sent you a password reset link.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-green-400">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {message && (
            <div className="text-green-400 text-center">{message}</div>
          )}

          {error && (
            <div className="text-red-400 text-center">{error}</div>
          )}

          <motion.button
            type="submit"
            className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Reset Link
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-green-400 hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;