'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { eventsApi, CreateEventData } from '../../api/eventsApi';
import { venueApi, Venue } from '../../api/venueApi';
import { Upload, X, Plus, Calendar, MapPin, DollarSign, Users, Tag, Image as ImageIcon } from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventForm, setEventForm] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    capacity: 0,
    pricing: [{ category: 'standard', price: 0 }],
    tags: [],
    image: ''
  });
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await venueApi.getVenues({ limit: 100 });
        if (response.success) {
          setVenues(response.data.venues);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    const fetchMyEvents = async () => {
      try {
        const response = await eventsApi.getEvents({ organizer: user?._id });
        if (response.success) {
          setMyEvents(response.data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (activeTab === 'create') {
      fetchVenues();
    } else if (activeTab === 'manage' && user?._id) {
      fetchMyEvents();
    }
  }, [activeTab, user?._id]);

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (index: number, field: 'category' | 'price', value: string | number) => {
    const newPricing = [...eventForm.pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setEventForm(prev => ({ ...prev, pricing: newPricing }));
  };

  const addPricingTier = () => {
    setEventForm(prev => ({
      ...prev,
      pricing: [...prev.pricing, { category: '', price: 0 }]
    }));
  };

  const removePricingTier = (index: number) => {
    if (eventForm.pricing.length > 1) {
      const newPricing = eventForm.pricing.filter((_, i) => i !== index);
      setEventForm(prev => ({ ...prev, pricing: newPricing }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !eventForm.tags?.includes(tag)) {
      setEventForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setEventForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll use a placeholder image URL since we don't have file upload implemented
      const eventData = {
        ...eventForm,
        image: imagePreview || '/placeholder-event.jpg'
      };

      const response = await eventsApi.createEvent(eventData);
      if (response.success) {
        alert('Event created successfully!');
        // Reset form
        setEventForm({
          title: '',
          description: '',
          date: '',
          venue: '',
          category: '',
          capacity: 0,
          pricing: [{ category: 'standard', price: 0 }],
          tags: [],
          image: ''
        });
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEvents = myEvents.length;
    const totalTicketsSold = myEvents.reduce((sum, event) => sum + (event.analytics?.ticketsSold || 0), 0);
    const totalRevenue = myEvents.reduce((sum, event) => sum + (event.analytics?.revenue || 0), 0);

    return { totalEvents, totalTicketsSold, totalRevenue };
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'create', label: 'Create Event' },
    { id: 'manage', label: 'Manage Events' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-3xl font-bold mb-8 text-green-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Organizer Dashboard
          </motion.h1>

          <div className="bg-gray-800 rounded-lg shadow-lg">
            <div className="border-b border-gray-700">
              <nav className="flex">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      className="bg-gray-700 p-6 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <h3 className="text-lg font-semibold text-green-400">Total Events</h3>
                      <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                    </motion.div>
                    <motion.div
                      className="bg-gray-700 p-6 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <h3 className="text-lg font-semibold text-green-400">Total Tickets Sold</h3>
                      <p className="text-3xl font-bold text-white">{stats.totalTicketsSold}</p>
                    </motion.div>
                    <motion.div
                      className="bg-gray-700 p-6 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <h3 className="text-lg font-semibold text-green-400">Revenue</h3>
                      <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">Create New Event</h2>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white mb-2 font-medium">Event Title *</label>
                          <input
                            type="text"
                            required
                            value={eventForm.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                            placeholder="Enter event title"
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-medium">Category *</label>
                          <select
                            required
                            value={eventForm.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                          >
                            <option value="">Select category</option>
                            <option value="music">Music</option>
                            <option value="sports">Sports</option>
                            <option value="technology">Technology</option>
                            <option value="business">Business</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="education">Education</option>
                            <option value="food">Food & Drink</option>
                            <option value="arts">Arts & Culture</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-medium">Date & Time *</label>
                          <input
                            type="datetime-local"
                            required
                            value={eventForm.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-medium">Venue *</label>
                          <select
                            required
                            value={eventForm.venue}
                            onChange={(e) => handleInputChange('venue', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                          >
                            <option value="">Select venue</option>
                            {venues.map(venue => (
                              <option key={venue._id} value={venue._id}>
                                {venue.name} - {venue.address.city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-white mb-2 font-medium">Description *</label>
                        <textarea
                          rows={4}
                          required
                          value={eventForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                          placeholder="Describe your event in detail..."
                        />
                      </div>
                    </div>

                    {/* Capacity & Image */}
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Capacity & Media
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white mb-2 font-medium">Total Capacity *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={eventForm.capacity}
                            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                            placeholder="Maximum attendees"
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-medium">Event Image</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="flex items-center justify-center w-full px-4 py-3 bg-gray-600 text-white rounded-lg border border-gray-500 cursor-pointer hover:bg-gray-500 transition-colors"
                            >
                              <Upload className="w-5 h-5 mr-2" />
                              {imageFile ? imageFile.name : 'Choose Image'}
                            </label>
                          </div>
                        </div>
                      </div>
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Event preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Pricing Tiers */}
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Pricing Tiers
                      </h3>
                      <div className="space-y-4">
                        {eventForm.pricing.map((tier, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-4 p-4 bg-gray-600 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Tier name (e.g., Standard, VIP, Premium)"
                                value={tier.category}
                                onChange={(e) => handlePricingChange(index, 'category', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={tier.price}
                                onChange={(e) => handlePricingChange(index, 'price', parseFloat(e.target.value))}
                                className="w-24 px-3 py-2 bg-gray-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            {eventForm.pricing.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingTier(index)}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                        <button
                          type="button"
                          onClick={addPricingTier}
                          className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Pricing Tier</span>
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2" />
                        Tags
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {eventForm.tags?.map(tag => (
                            <span
                              key={tag}
                              className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleTagRemove(tag)}
                                className="hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add tags (press Enter to add)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleTagAdd(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-8 py-4 rounded-lg font-semibold hover:from-green-400 hover:to-cyan-400 transition-all duration-150 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loading ? 'Creating Event...' : 'Create Event'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'manage' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">Manage Events</h2>
                  {myEvents.length > 0 ? (
                    <div className="space-y-6">
                      {myEvents.map((event, index) => (
                        <motion.div
                          key={event._id}
                          className="bg-gray-700/50 p-6 rounded-lg border border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-start space-x-4">
                                {event.image && (
                                  <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-green-400" />
                                      <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="w-4 h-4 text-green-400" />
                                      <span>{event.venue?.name || 'TBA'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Users className="w-4 h-4 text-green-400" />
                                      <span>{event.analytics?.attendees || 0} / {event.capacity}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      event.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                      event.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                                      event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => setEditingEvent(event._id)}
                                className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2"
                              >
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this event?')) {
                                    try {
                                      await eventsApi.deleteEvent(event._id);
                                      setMyEvents(prev => prev.filter(e => e._id !== event._id));
                                    } catch (error) {
                                      console.error('Error deleting event:', error);
                                      alert('Failed to delete event');
                                    }
                                  }
                                }}
                                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
                              >
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-4">No events found</div>
                      <p className="text-gray-500">Create your first event to get started!</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Analytics</h2>
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <p className="text-gray-400">Analytics charts would go here (using Recharts)</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;