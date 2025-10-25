"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Building2, Users } from 'lucide-react';
import VenueCard from '../../components/VenueCard';
import Loader from '../../components/Loader';
import { venueApi, Venue, VenueFilters, VenueSearchFilters } from '../../api/venueApi';

const VenuesPage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<VenueFilters>({});
  const [searchFilters, setSearchFilters] = useState<VenueSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchQuery.trim() || Object.keys(searchFilters).length > 0) {
        // Use search API if there's a search query or filters
        const searchParams = {
          q: searchQuery.trim() || undefined,
          ...searchFilters,
          page: pagination.page,
          limit: pagination.limit
        };
        response = await venueApi.searchVenues(searchParams);
      } else {
        // Use regular getVenues API
        response = await venueApi.getVenues({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });
      }

      if (response.success) {
        setVenues(response.data.venues);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination
          }));
        }
      } else {
        setError('Failed to load venues');
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [pagination.page, filters, searchFilters, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVenues();
  };

  const handleFilterChange = (key: keyof VenueSearchFilters, value: string | number | string[] | undefined) => {
    setSearchFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || value === '') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
      return newFilters;
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchFilters({});
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const venueTypes = ['indoor', 'outdoor', 'hybrid'];
  const facilities = ['WiFi', 'Parking', 'Catering', 'Sound System', 'Lighting', 'Stage', 'Restrooms'];

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
            Discover Venues
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find the perfect venue for your next event. Browse through our curated collection of premium venues.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search venues by name, city, or facilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
              {(Object.keys(searchFilters).length > 0 || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={searchFilters.city || ''}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Venue Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Venue Type
                  </label>
                  <select
                    value={searchFilters.venueType || ''}
                    onChange={(e) => handleFilterChange('venueType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Types</option>
                    {venueTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Capacity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Min Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Minimum capacity"
                    value={searchFilters.minCapacity || ''}
                    onChange={(e) => handleFilterChange('minCapacity', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Max Capacity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Maximum capacity"
                    value={searchFilters.maxCapacity || ''}
                    onChange={(e) => handleFilterChange('maxCapacity', parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.div
            className="mb-6 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {venues.length > 0 ? (
              <span>
                Showing {venues.length} of {pagination.total} venues
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            ) : (
              <span>No venues found</span>
            )}
          </motion.div>
        )}

        {/* Venues Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={fetchVenues}
              className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-2 rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        ) : venues.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-gray-400 text-xl mb-4">No venues found</div>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {venues.map((venue, index) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VenueCard venue={venue} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                className="flex justify-center items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                >
                  Previous
                </button>

                <span className="text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VenuesPage;