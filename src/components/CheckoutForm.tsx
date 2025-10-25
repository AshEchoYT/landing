import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { paymentApi } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';
import { useSeatStore } from '../store/useSeatStore';
import { CreditCard, AlertCircle, CheckCircle2, Zap, User, Calendar, MapPin } from 'lucide-react';

const CheckoutForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedSeats, clearSeats } = useSeatStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'processing' | 'success' | 'error'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Form state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
      return 'Please enter a valid card number';
    }
    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    if (!cardDetails.name.trim()) {
      return 'Please enter the cardholder name';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedSeats.length === 0 || !user) {
      setError('No seats selected or user information missing. Please go back and select seats.');
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('initiating');

    try {
      // Step 1: Initiate payments for all booked seats (tickets)
      const paymentPromises = selectedSeats.map(async (seat) => {
        try {
          if (!seat.ticketId) {
            throw new Error(`Ticket ID not found for seat ${seat.seatNo}`);
          }

          return await paymentApi.initiatePayment({
            ticketId: seat.ticketId,
            paymentMethod: 'card',
            amount: seat.price,
            category: seat.category
          });
        } catch (error: any) {
          console.error(`Failed to initiate payment for seat ${seat.seatNo}:`, error);
          throw new Error(`Payment initiation failed for seat ${seat.seatNo}: ${error.response?.data?.message || error.message}`);
        }
      });

      const paymentResults = await Promise.allSettled(paymentPromises);
      const successfulPayments = paymentResults.filter(result => result.status === 'fulfilled');
      const failedPayments = paymentResults.filter(result => result.status === 'rejected');

      if (successfulPayments.length === 0) {
        throw new Error('Failed to initiate any payments. Please try again.');
      }

      if (failedPayments.length > 0) {
        console.warn(`${failedPayments.length} payment initiations failed:`, failedPayments);
        // Continue with successful payments but warn user
        setError(`${failedPayments.length} payment(s) failed to initiate. Proceeding with ${successfulPayments.length} successful payment(s).`);
      }

      const paymentIds = successfulPayments.map((result: any) => result.value.data.paymentId);

      if (paymentIds.length > 0) {
        setPaymentId(paymentIds[0]); // Store first payment ID for status tracking
        setPaymentStatus('processing');

        // Step 2: Process payments
        const processPromises = paymentIds.map(async (id: string, index: number) => {
          try {
            const result = await paymentApi.processPayment(id, {
              cardDetails: {
                number: cardDetails.number.replace(/\s/g, ''),
                expiry: cardDetails.expiry,
                cvv: cardDetails.cvv,
                name: cardDetails.name
              }
            });
            return result;
          } catch (error: any) {
            console.error(`Payment processing failed for payment ${id}:`, error);
            throw new Error(`Payment processing failed for seat ${selectedSeats[index]?.seatNo || 'unknown'}: ${error.response?.data?.message || error.message}`);
          }
        });

        const processResults = await Promise.allSettled(processPromises);
        const successfulProcesses = processResults.filter(result => result.status === 'fulfilled');
        const failedProcesses = processResults.filter(result => result.status === 'rejected');

        // Check if all payments were successful
        if (successfulProcesses.length === paymentIds.length) {
          setPaymentStatus('success');

          // Clear seat selection
          clearSeats();

          // Redirect to tickets page after a short delay
          setTimeout(() => {
            router.push('/tickets');
          }, 2000);
        } else if (successfulProcesses.length > 0) {
          // Partial success - some payments succeeded
          setPaymentStatus('error');
          setError(`${successfulProcesses.length} payment(s) succeeded, but ${failedProcesses.length} failed. Please contact support with payment ID: ${paymentIds[0]}`);
        } else {
          // All payments failed
          setPaymentStatus('error');
          throw new Error('All payments failed. Please check your card details and try again.');
        }
      } else {
        throw new Error('Failed to initiate payments');
      }

    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || err.response?.data?.message || 'Payment failed. Please try again.');
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Details */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span className="text-white text-lg font-semibold">Card Details</span>
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-white mb-2">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
            maxLength={19}
            className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div>
            <label className="block text-white mb-2">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => handleInputChange('expiry', formatExpiry(e.target.value))}
              maxLength={5}
              className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* CVV */}
          <div>
            <label className="block text-white mb-2">CVV</label>
            <input
              type="text"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-white mb-2">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={cardDetails.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
          />
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
      {paymentStatus === 'initiating' && (
        <motion.div
          className="flex items-center justify-center space-x-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-blue-400 font-semibold">Initiating payment...</span>
        </motion.div>
      )}

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
          <span className="text-green-400 font-semibold">Payment successful! Creating tickets...</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading || paymentStatus === 'success'}
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
        <p className="mt-1">This is a simulation - no real payment will be processed</p>
      </motion.div>
    </form>
  );
};

export default CheckoutForm;