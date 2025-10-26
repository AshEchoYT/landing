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
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (user?._id) {
        try {
          const data = await ticketsApi.getUserTickets(user._id);
          setTickets(data.data.tickets);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTickets();
  }, [user]);

  const handleDownload = async (ticket: Ticket) => {
    setDownloading(ticket._id);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, this would trigger the actual download
      console.log('Downloading ticket:', ticket._id);
    } catch (error) {
      console.error('Error downloading ticket:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,197,94,0.05),transparent,rgba(6,182,212,0.05),transparent)] animate-spin" style={{animationDuration: '35s'}}></div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              My Tickets
            </h1>
            <p className="text-gray-400 text-lg">Your digital tickets for upcoming events</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {tickets.length > 0 ? (
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
                            src="/api/placeholder/400/200"
                            alt={typeof ticket.event === 'object' ? ticket.event.name : 'Event'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Ticket Badge */}
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            VALID TICKET
                          </div>
                        </div>

                        {/* Ticket Content */}
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                            {typeof ticket.event === 'object' ? ticket.event.name : 'Event Title'}
                          </h3>

                          {/* Event Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3 text-gray-300">
                              <Calendar className="w-5 h-5 text-green-400" />
                              <span>{typeof ticket.event === 'object' ? formatDate(ticket.event.startDate) + ' at ' + formatTime(ticket.event.startDate) : 'Date TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-300">
                              <MapPin className="w-5 h-5 text-cyan-400" />
                              <span>{typeof ticket.event === 'object' && typeof ticket.event.venue === 'object' ? ticket.event.venue.name : 'Venue TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-300">
                              <TicketIcon className="w-5 h-5 text-purple-400" />
                              <span>Seat {ticket.seatNo}</span>
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
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-sm">Active</span>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              <motion.div
                                className="relative p-3 bg-white rounded-lg shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <img
                                  src={ticket.qrCode}
                                  alt="QR Code"
                                  className="w-32 h-32"
                                />
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
                                <>
                                  <motion.div
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <span>Downloading...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5" />
                                  <span>Download Ticket</span>
                                </>
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