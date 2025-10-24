'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSeatStore } from '../../store/useSeatStore';
import { formatPrice } from '../../utils/formatters';
import CheckoutForm from '../../components/CheckoutForm';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CreditCard, Shield, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
  const router = useRouter();
  const { selectedSeats } = useSeatStore();

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,197,94,0.05),transparent,rgba(6,182,212,0.05),transparent)] animate-spin" style={{animationDuration: '30s'}}></div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <p className="text-gray-400 text-lg">Complete your booking with confidence</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20 shadow-2xl">
                {/* Neon Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl -z-10"></div>

                <div className="relative">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span>Order Summary</span>
                  </h2>

                  {/* Selected Seats */}
                  <div className="space-y-4 mb-8">
                    {selectedSeats.map((seat, index) => (
                      <motion.div
                        key={seat.id}
                        className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl border border-gray-600/50"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-green-400 font-bold text-sm">{seat.row}{seat.number}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">Seat {seat.row}{seat.number}</p>
                            <p className="text-gray-400 text-sm capitalize">{seat.category.replace('-', ' ')}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold text-lg">{formatPrice(seat.price)}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <motion.div
                    className="border-t border-gray-600/50 pt-6"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex justify-between items-center text-2xl font-bold text-white mb-6">
                      <span>Total Amount</span>
                      <span className="text-green-400">{formatPrice(totalPrice)}</span>
                    </div>

                    {/* Security Badges */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-sm">SSL Encrypted Payment</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Lock className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm">256-bit Security</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <span className="text-sm">All Major Cards Accepted</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl">
                {/* Neon Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-green-400/20 to-cyan-400/20 rounded-2xl blur-xl -z-10"></div>

                <div className="relative">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <CreditCard className="w-8 h-8 text-cyan-400" />
                    <span>Payment Details</span>
                  </h2>

                  <CheckoutForm />
                </div>
              </div>

              {/* Back Button */}
              <motion.button
                onClick={() => router.back()}
                className="mt-6 w-full flex items-center justify-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white py-3 rounded-xl transition-all duration-300 border border-gray-600/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Seat Selection</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;