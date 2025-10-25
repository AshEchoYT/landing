"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Ticket,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import {
  attendeeApi,
  AttendeeStats,
  AttendeeTicket,
  AttendeeEvent,
  AttendeePayment
} from '../../api/attendeeApi';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendeeStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<AttendeeTicket[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AttendeeEvent[]>([]);
  const [recentPayments, setRecentPayments] = useState<AttendeePayment[]>([]);
  const [allEvents, setAllEvents] = useState<AttendeeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total spent from payments
  const totalSpentFromPayments = recentPayments.reduce((total, payment) => total + (payment.amount || 0), 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching dashboard data for user:', user);

        // Fetch data one by one with better error handling
        try {
          const statsResponse = await attendeeApi.getAttendeeStats();
          console.log('Stats response:', statsResponse);
          if (statsResponse.success) {
            setStats(statsResponse.data.stats);
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
        }

        try {
          const ticketsResponse = await attendeeApi.getAttendeeTickets({ limit: 10 });
          console.log('Tickets response:', ticketsResponse);
          if (ticketsResponse.success) {
            setRecentTickets(ticketsResponse.data.tickets);
          }
        } catch (ticketsError) {
          console.error('Error fetching tickets:', ticketsError);
        }

        try {
          const eventsResponse = await attendeeApi.getAttendeeEvents({ limit: 20, status: 'all' });
          console.log('Events response:', eventsResponse);
          if (eventsResponse.success) {
            const events = eventsResponse.data.events;
            setAllEvents(events);
            // Filter for upcoming events (events with future dates)
            const upcoming = events.filter(event => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              return eventDate > new Date();
            });
            setUpcomingEvents(upcoming);
          }
        } catch (eventsError) {
          console.error('Error fetching events:', eventsError);
        }

        try {
          const paymentsResponse = await attendeeApi.getAttendeePayments({ limit: 5 });
          console.log('Payments response:', paymentsResponse);
          if (paymentsResponse.success) {
            setRecentPayments(paymentsResponse.data.payments);
          }
        } catch (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
        }

      } catch (err) {
        console.error('General error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
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
      case 'used':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'used':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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
            <div className="text-red-400 text-xl mb-4">Please log in to view your dashboard</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-500 bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            Welcome back, {user.name}!
          </motion.h1>
          <p className="text-xl text-gray-400">
            Here's an overview of your events and tickets
          </p>
        </motion.div>

        {/* Quick Stats Summary */}
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-purple-500/10 rounded-xl border border-green-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Dashboard Overview</h3>
              <p className="text-gray-400 text-sm">
                Track your event journey and spending
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">₹{totalSpentFromPayments.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Spent</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-colors"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tickets</p>
                <p className="text-3xl font-bold text-white">{stats?.totalTickets || 0}</p>
                <p className="text-gray-500 text-xs mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-colors"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Tickets</p>
                <p className="text-3xl font-bold text-white">{stats?.activeTickets || 0}</p>
                <p className="text-gray-500 text-xs mt-1">Valid tickets</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-colors"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-white">₹{totalSpentFromPayments.toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-1">On tickets</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-colors"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Events Attended</p>
                <p className="text-3xl font-bold text-white">{stats?.eventsAttended || 0}</p>
                <p className="text-gray-500 text-xs mt-1">Unique events</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tickets */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Tickets</h2>
              <Link href="/tickets">
                <button className="text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket._id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Ticket Preview */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                        <Ticket className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{ticket.event?.title || 'Event Title'}</h3>
                        <p className="text-gray-400 text-sm">{ticket.event?.venue?.name || 'Venue'}</p>
                        <p className="text-gray-400 text-sm">Seat: {ticket.seatNo || 'N/A'} • {ticket.category || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 mb-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm capitalize">{ticket.status}</span>
                      </div>
                      <p className="text-green-400 font-semibold">₹{ticket.price || 0}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <Link href="/tickets">
                  <button className="mt-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors">
                    Browse Tickets
                  </button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
              <Link href="/events">
                <button className="text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1">
                  <span>Browse Events</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Event Preview */}
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <Calendar className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{event.title || 'Event Title'}</h3>
                        <p className="text-gray-400 text-sm">{event.venue?.name || 'Venue'}</p>
                        <p className="text-gray-400 text-sm">{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm capitalize">{event.ticketStatus || 'Available'}</span>
                      <p className="text-gray-400 text-xs mt-1">{event.category || 'Event'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <Link href="/events">
                  <button className="mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors">
                    Browse Events
                  </button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Payments */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Payments</h2>
              <Link href="/payments">
                <button className="text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment._id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Payment Preview */}
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                        <DollarSign className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{payment.ticket?.event || 'Event Payment'}</h3>
                        <p className="text-gray-400 text-sm">{payment.mode || 'Payment Method'} • {payment.date ? new Date(payment.date).toLocaleDateString() : 'Date'}</p>
                        <p className="text-gray-400 text-sm">Transaction: {payment.transactionId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 mb-1 ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="text-sm capitalize">{payment.status}</span>
                      </div>
                      <p className="text-green-400 font-semibold">₹{payment.amount || 0}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No payment history</p>
                <p className="text-gray-500 text-sm">Your payment transactions will appear here</p>
                <Link href="/payments">
                  <button className="mt-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-colors">
                    View Payments
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;