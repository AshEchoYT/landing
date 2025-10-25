"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  attendeeApi,
  AttendeePayment
} from '../../api/attendeeApi';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<AttendeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching all payments for user:', user);

        const paymentsResponse = await attendeeApi.getAttendeePayments({ limit: 100 });
        console.log('All payments response:', paymentsResponse);
        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data.payments);
        } else {
          setError('Failed to load payments');
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'upi':
        return <Receipt className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const totalSpent = payments.reduce((total, payment) => total + (payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-400 text-xl mb-4">Please log in to view your payments</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-500 bg-clip-text text-transparent">
                Payment History
              </h1>
              <p className="text-gray-400 mt-2">
                View all your payment transactions
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-400">₹{totalSpent.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Total Spent</p>
          </div>
        </motion.div>

        {/* Payment Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-white">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Successful Payments</p>
                <p className="text-2xl font-bold text-white">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Payment</p>
                <p className="text-2xl font-bold text-white">
                  ₹{payments.length > 0 ? (totalSpent / payments.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Payments List */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">All Payments</h2>
            <p className="text-gray-400 text-sm mt-1">Complete transaction history</p>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : payments.length > 0 ? (
            <div className="divide-y divide-gray-700/30">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  className="p-6 hover:bg-gray-700/20 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Payment Method Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                        {getPaymentMethodIcon(payment.mode)}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">
                          {payment.ticket?.event || 'Event Payment'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{payment.date ? new Date(payment.date).toLocaleDateString() : 'Date N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span className="capitalize">{payment.mode || 'Method'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Receipt className="w-4 h-4" />
                            <span>{payment.transactionId || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center space-x-2 mb-2 ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="text-sm font-medium capitalize">{payment.status}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">₹{payment.amount || 0}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No payments found</p>
              <p className="text-gray-500 text-sm mb-6">Your payment transactions will appear here</p>
              <Link href="/events">
                <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-6 py-3 rounded-lg transition-colors">
                  Browse Events
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentsPage;