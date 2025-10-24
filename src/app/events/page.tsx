'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsApi } from '../../api/eventsApi';
import { useEventStore } from '../../store/useEventStore';
import EventCard from '../../components/EventCard';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Search, Filter, Sparkles } from 'lucide-react';

const EventsList = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    date: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { events, setEvents } = useEventStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getEvents(filters);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters, setEvents]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <Loader />;

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

      <div className="pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-6 py-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Discover Amazing Events</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Events That Inspire
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Explore a world of extraordinary experiences, from cutting-edge concerts to immersive art exhibitions.
              Find your next unforgettable moment.
            </motion.p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Search Bar */}
              <motion.div
                className="relative w-full md:w-96"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events, artists, venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                />
              </motion.div>

              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:border-green-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.div>
              </motion.button>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-6 p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-white mb-2 font-medium">Event Type</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="concert">Concert</option>
                        <option value="festival">Festival</option>
                        <option value="theater">Theater</option>
                        <option value="art">Art</option>
                        <option value="sports">Sports</option>
                        <option value="conference">Conference</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">City/Venue</label>
                      <input
                        type="text"
                        placeholder="Enter city or venue"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Events Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={`${event.id}-${searchTerm}`}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                    ease: 'easeOut'
                  }}
                  whileHover={{ y: -5 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Search className="w-12 h-12 text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">No Events Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters to find more events.</p>
              <motion.button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ type: '', city: '', date: '' });
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventsList;