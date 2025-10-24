import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/tickets`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setPaymentStatus('error');
      } else {
        setPaymentStatus('success');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element Container */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-white mb-3 text-lg font-semibold flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span>Card Information</span>
        </label>

        <div className="relative bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-green-500/20 to-cyan-500/20"
            animate={{
              boxShadow: [
                '0 0 0 rgba(6, 182, 212, 0)',
                '0 0 20px rgba(6, 182, 212, 0.3)',
                '0 0 0 rgba(6, 182, 212, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative">
            <PaymentElement
              options={{
                layout: 'tabs'
              }}
              className="stripe-payment-element"
            />
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Payment Status */}
      {paymentStatus === 'processing' && (
        <motion.div
          className="flex items-center justify-center space-x-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-yellow-400 font-semibold">Processing payment...</span>
        </motion.div>
      )}

      {paymentStatus === 'success' && (
        <motion.div
          className="flex items-center justify-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">Payment successful! Redirecting...</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || loading || paymentStatus === 'success'}
        className="group relative w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-center space-x-3">
          {loading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Processing...</span>
            </>
          ) : paymentStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Payment Complete</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Complete Payment</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Security Notice */}
      <motion.div
        className="text-center text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>Your payment information is secure and encrypted</p>
        <p className="mt-1">Powered by Stripe</p>
      </motion.div>
    </form>
  );
};

export default CheckoutForm;