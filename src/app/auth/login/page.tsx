'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import AnimatedButton from '../../../components/AnimatedButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      router.push('/events');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-green-400">Login</h1>

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

          <div>
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-center">{error}</div>
          )}

          <motion.button
            type="submit"
            className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-green-400 hover:underline">
              Sign up
            </Link>
          </p>
          <Link href="/auth/forgot-password" className="text-gray-400 hover:text-green-400 block mt-2">
            Forgot password?
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;