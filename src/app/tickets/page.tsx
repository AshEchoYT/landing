'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketsApi, Ticket } from '../../api/ticketsApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/formatters';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Download, QrCode, Calendar, MapPin, Ticket as TicketIcon, Star, Zap, CheckCircle } from 'lucide-react';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (user?._id) {
        try {
          setLoading(true);
          setError(null);
          console.log('Fetching tickets for user:', user._id);
          const data = await ticketsApi.getUserTickets(user._id);
          console.log('API Response:', data);
          console.log('Tickets data:', data.data?.tickets);
          setTickets(data.data.tickets || []);
        } catch (error) {
          console.error('Error fetching tickets:', error);
          setError('Failed to load your tickets. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No user ID available');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const handleDownload = async (ticket: Ticket) => {
    setDownloading(ticket._id);
    try {
      await ticketsApi.downloadTicket(ticket._id);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
              <p className="text-gray-300 mb-6">Please log in to view your tickets.</p>
              <motion.a
                href="/auth/login"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-5 h-5" />
                <span>Login</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-pink-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-yellow-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              My Tickets
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Your digital tickets for upcoming events - ready to scan and enjoy!</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <motion.button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                </div>
              </motion.div>
            ) : tickets.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket._id}
                    className="relative group"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    {/* Ticket Card */}
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-green-500/20 shadow-2xl hover:shadow-green-500/30 transition-all duration-500">
                      {/* Neon Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative">
                        {/* Event Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={typeof ticket.event === 'object' && ticket.event ? '/api/placeholder/400/200' : '/api/placeholder/400/200'}
                            alt={typeof ticket.event === 'object' && ticket.event ? ticket.event.name : 'Event'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Ticket Badge */}
                          <motion.div
                            className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            VALID TICKET
                          </motion.div>

                          {/* Floating Status Indicator */}
                          <motion.div
                            className="absolute top-4 left-4 flex items-center space-x-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-semibold">Active</span>
                          </motion.div>
                        </div>

                        {/* Ticket Content */}
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                            {typeof ticket.event === 'object' && ticket.event ? ticket.event.name : 'Event Title'}
                          </h3>

                          {/* Event Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3 text-gray-300">
                              <Calendar className="w-5 h-5 text-green-400" />
                              <span>{typeof ticket.event === 'object' && ticket.event ? `${formatDate(ticket.event.startDate)} at ${formatTime(ticket.event.startDate)}` : 'Date TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-300">
                              <MapPin className="w-5 h-5 text-cyan-400" />
                              <span>{typeof ticket.event === 'object' && ticket.event && typeof ticket.event.venue === 'object' && ticket.event.venue ? ticket.event.venue.name : 'Venue TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-300">
                              <TicketIcon className="w-5 h-5 text-purple-400" />
                              <span>Seat {ticket.seatNo || 'N/A'}</span>
                            </div>
                          </div>

                          {/* QR Code Section */}
                          <div className="bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-600/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <QrCode className="w-5 h-5 text-green-400" />
                                <span className="text-white font-semibold">Digital Ticket</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <motion.div
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-green-400 text-sm">Ready to Scan</span>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              <motion.div
                                className="relative p-3 bg-white rounded-lg shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {ticket.qrCode ? (
                                  <img
                                    src={ticket.qrCode}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                    onError={(e) => {
                                      console.error('QR code failed to load:', ticket.qrCode);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                    QR Code Not Available
                                  </div>
                                )}
                                {/* QR Code Glow Effect */}
                                <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Download Button */}
                          <motion.button
                            onClick={() => handleDownload(ticket)}
                            disabled={downloading === ticket._id}
                            className="group/btn relative w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center space-x-3">
                              {downloading === ticket._id ? (
                                <div className="flex items-center space-x-3">
                                  <motion.div
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <span>Downloading...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-3">
                                  <Download className="w-5 h-5" />
                                  <span>Download Ticket</span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TicketIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">No Tickets Yet</h2>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  You haven't booked any tickets yet. Discover amazing events and secure your spot!
                </p>
                <motion.a
                  href="/events"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-6 h-6" />
                  <span>Explore Events</span>
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyTicketsPage;