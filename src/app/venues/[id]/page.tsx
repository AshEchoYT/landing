"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  Star,
  Building2,
  Wifi,
  Car,
  Utensils,
  Volume2,
  Lightbulb,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { venueApi, Venue, VenueAvailability } from '../../../api/venueApi';

const VenueDetailPage = () => {
  const params = useParams();
  const venueId = params?.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [availability, setAvailability] = useState<VenueAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [venueResponse, availabilityResponse] = await Promise.all([
          venueApi.getVenue(venueId),
          venueApi.getVenueAvailability(venueId)
        ]);

        if (venueResponse.success) {
          setVenue(venueResponse.data.venue);
        } else {
          setError('Failed to load venue details');
        }

        if (availabilityResponse.success) {
          setAvailability(availabilityResponse.data.availability);
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    try {
      const response = await venueApi.getVenueAvailability(venueId, date);
      if (response.success) {
        setAvailability(response.data.availability);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  const getFacilityIcon = (facility: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'WiFi': Wifi,
      'Parking': Car,
      'Catering': Utensils,
      'Sound System': Volume2,
      'Lighting': Lightbulb,
      'Stage': Building2,
      'Restrooms': Users
    };
    const IconComponent = iconMap[facility] || Building2;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-400 text-xl mb-4">⚠️ {error || 'Venue not found'}</div>
            <Link href="/venues">
              <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-2 rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all">
                Back to Venues
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const primaryImage = venue.primaryImage || venue.images?.find(img => img.isPrimary)?.url || '/placeholder-venue.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/venues">
            <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Venues</span>
            </button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <motion.div
              className="relative rounded-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={primaryImage}
                alt={venue.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{venue.name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.fullAddress || `${venue.address.street}, ${venue.address.city}, ${venue.address.state}`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{venue.rating.toFixed(1)} ({venue.totalEvents} events)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            {venue.description && (
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">About This Venue</h2>
                <p className="text-gray-300 leading-relaxed">{venue.description}</p>
              </motion.div>
            )}

            {/* Facilities */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.facilities.map((facility, index) => (
                  <motion.div
                    key={facility}
                    className="flex items-center space-x-3 text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-green-400">
                      {getFacilityIcon(facility)}
                    </div>
                    <span>{facility}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Information */}
            {venue.contactInfo && (
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {venue.contactInfo.phone && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Phone: {venue.contactInfo.phone}</span>
                    </div>
                  )}
                  {venue.contactInfo.email && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Email: {venue.contactInfo.email}</span>
                    </div>
                  )}
                  {venue.contactInfo.manager && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Manager: {venue.contactInfo.manager.name} ({venue.contactInfo.manager.phone})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pricing */}
            {venue.pricing && (
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Pricing Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Base Rate: {venue.pricing.currency} {venue.pricing.baseRate}</span>
                  </div>
                  {venue.pricing.additionalFees && venue.pricing.additionalFees.map((fee, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>{fee.name}: {venue.pricing!.currency} {fee.amount} ({fee.type})</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Venue Stats */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Venue Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-white font-semibold">{venue.capacity} guests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white font-semibold capitalize">{venue.venueType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{venue.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Events:</span>
                  <span className="text-white font-semibold">{venue.totalEvents}</span>
                </div>
              </div>
            </motion.div>

            {/* Availability Checker */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Check Availability</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {availability.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Available Times:</h4>
                    {availability.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.isBooked ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black py-3 rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-150 shadow-lg hover:shadow-green-500/50">
                Book This Venue
              </button>
              <button className="w-full bg-gray-700/50 text-white py-3 rounded-lg font-semibold hover:bg-gray-600/50 transition-all duration-150">
                Contact Venue
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;