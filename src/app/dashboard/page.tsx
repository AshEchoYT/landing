"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Ticket,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, ticketsResponse, eventsResponse, paymentsResponse] = await Promise.all([
          attendeeApi.getAttendeeStats(),
          attendeeApi.getAttendeeTickets({ limit: 5 }),
          attendeeApi.getAttendeeEvents({ limit: 5, status: 'upcoming' }),
          attendeeApi.getAttendeePayments({ limit: 5 })
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data.stats);
        }

        if (ticketsResponse.success) {
          setRecentTickets(ticketsResponse.data.tickets);
        }

        if (eventsResponse.success) {
          setUpcomingEvents(eventsResponse.data.events);
        }

        if (paymentsResponse.success) {
          setRecentPayments(paymentsResponse.data.payments);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
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

        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tickets</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
                </div>
                <Ticket className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Tickets</p>
                  <p className="text-3xl font-bold text-white">{stats.activeTickets}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-3xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Events Attended</p>
                  <p className="text-3xl font-bold text-white">{stats.eventsAttended}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </motion.div>
        )}

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
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{ticket.event.title}</h3>
                      <p className="text-gray-400 text-sm">{ticket.event.venue.name}</p>
                      <p className="text-gray-400 text-sm">Seat: {ticket.seatNo}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm capitalize">{ticket.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm">${ticket.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tickets found</p>
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
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{event.title}</h3>
                      <p className="text-gray-400 text-sm">{event.venue.name}</p>
                      <p className="text-gray-400 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm capitalize">{event.ticketStatus}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
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
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{payment.ticket.event}</h3>
                      <p className="text-gray-400 text-sm">{payment.mode} • {new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="text-sm capitalize">{payment.status}</span>
                      </div>
                      <p className="text-white font-semibold">${payment.amount}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No payment history</p>
            )}
          </motion.div>

          {/* Favorite Categories */}
          {stats && stats.favoriteCategories.length > 0 && (
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Favorite Categories</h2>
              <div className="space-y-4">
                {stats.favoriteCategories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold capitalize">{category._id}</span>
                    </div>
                    <span className="text-gray-400">{category.count} events</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;