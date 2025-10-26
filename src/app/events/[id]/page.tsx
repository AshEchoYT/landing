'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { eventsApi } from '../../../api/eventsApi';
import { useEventStore } from '../../../store/useEventStore';
import { formatDate, formatTime, formatPrice } from '../../../utils/formatters';
import Loader from '../../../components/Loader';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Toast from '../../../components/Toast';
import { Calendar, MapPin, Users, Star, Zap, ArrowRight } from 'lucide-react';

const EventDetails = () => {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { currentEvent, setCurrentEvent } = useEventStore();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await eventsApi.getEvent(id);
        if (data.success && data.data.event) {
          setCurrentEvent(data.data.event);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, setCurrentEvent]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link href="/events">
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Events
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
              <p className="text-gray-300 mb-6">The event you're looking for doesn't exist or has been removed.</p>
              <Link href="/events">
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Events
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Static background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-pink-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Hero Section */}
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-green-500/20 shadow-2xl">
              {/* Neon Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl"></div>

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Event Image */}
                <motion.div
                  className="relative overflow-hidden rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={currentEvent.image}
                    alt={currentEvent.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Floating Badge */}
                  <motion.div
                    className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    FEATURED EVENT
                  </motion.div>
                </motion.div>

                {/* Event Info */}
                <div className="flex flex-col justify-center">
                  <motion.h1
                    className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentEvent.title}
                  </motion.h1>

                  <motion.p
                    className="text-gray-300 text-lg mb-6 leading-relaxed"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentEvent.description}
                  </motion.p>

                  {/* Event Details Grid */}
                  <motion.div
                    className="grid grid-cols-2 gap-6 mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-green-400 font-semibold">Date & Time</p>
                          <p className="text-white">{formatDate(currentEvent.date)}</p>
                          <p className="text-gray-400 text-sm">{formatTime(currentEvent.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-cyan-400 font-semibold">Venue</p>
                          <p className="text-white">{currentEvent.venue?.name || 'TBA'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-purple-400 font-semibold">Organizer</p>
                          <p className="text-white">{currentEvent.organizer}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-yellow-400 font-semibold">Rating</p>
                          <p className="text-white">4.9/5.0</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tags */}
                  <motion.div
                    className="flex flex-wrap gap-3 mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {currentEvent.tags.map((tag: string, index: number) => (
                      <motion.span
                        key={tag}
                        className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-green-400 px-4 py-2 rounded-full text-sm border border-green-500/30 backdrop-blur-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Link href={`/seatmap/${id}`}>
                      <motion.button
                        className="group relative w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center space-x-3">
                          <Zap className="w-6 h-6" />
                          <span>Book Your Seats Now</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Event Details */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Event Description */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                <Zap className="w-8 h-8 text-green-400" />
                <span>About This Event</span>
              </h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  {currentEvent.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-green-400 font-semibold text-sm mb-1">Duration</p>
                    <p className="text-white">3+ hours</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-cyan-400 font-semibold text-sm mb-1">Age Restriction</p>
                    <p className="text-white">18+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-cyan-400" />
                <span>Venue Details</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{currentEvent.venue?.name || 'Venue TBA'}</h3>
                  <p className="text-gray-400">Chennai, Tamil Nadu</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 font-semibold">Capacity</p>
                      <p className="text-white">2,500 seats</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-cyan-400 font-semibold">Facilities</p>
                      <p className="text-white">AC, Parking, Food Court</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-purple-400 font-semibold">Starting Price</p>
                      <p className="text-white">{formatPrice(10000)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20 shadow-2xl max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience This Event?</h2>
              <p className="text-gray-300 mb-8">Secure your seats now and join thousands of music lovers for an unforgettable night.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/seatmap/${id}`}>
                  <motion.button
                    className="group relative bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <Zap className="w-6 h-6" />
                      <span>Select Seats</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </Link>

                <motion.button
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-gray-600/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowToast(true);
                  }}
                >
                  Share Event
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />

      <Toast
        message="Event link copied to clipboard!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default EventDetails;