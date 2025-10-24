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
import { SeatMap } from '../../../components/SeatMap';
import { Calendar, MapPin, Users, Star, Zap, ArrowRight } from 'lucide-react';

const EventDetails = () => {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const { currentEvent, setCurrentEvent } = useEventStore();

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        try {
          const data = await eventsApi.getEvent(id as string);
          setCurrentEvent(data);
        } catch (error) {
          console.error('Error fetching event:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, setCurrentEvent]);

  if (loading || !currentEvent) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,197,94,0.05),transparent,rgba(6,182,212,0.05),transparent)] animate-spin" style={{animationDuration: '20s'}}></div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <p className="text-white">{currentEvent.venue}</p>
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
                        transition={{ delay: 0.6 + index * 0.1 }}
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

          {/* Seat Map Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">Select Your Seats</h2>
                <SeatMap
                  eventId={id}
                  onSeatSelect={setSelectedSeats}
                />
                {selectedSeats.length > 0 && (
                  <div className="mt-6 text-center">
                    <Link href={`/checkout?eventId=${id}`}>
                      <motion.button
                        className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-8 py-3 rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Proceed to Checkout (${selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)})
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Venue Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-green-400 font-semibold mb-1">Location</p>
                    <p className="text-gray-300">{currentEvent.venue}</p>
                  </div>
                  <div>
                    <p className="text-cyan-400 font-semibold mb-1">Available Seats</p>
                    <p className="text-gray-300">234 remaining</p>
                  </div>
                  <div>
                    <p className="text-purple-400 font-semibold mb-1">Starting Price</p>
                    <p className="text-gray-300">$120</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetails;