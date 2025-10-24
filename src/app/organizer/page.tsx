'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (user?.role !== 'organizer') {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Access Denied</div>;
  }

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
                    <div className="bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400">Total Events</h3>
                      <p className="text-3xl font-bold text-white">5</p>
                    </div>
                    <div className="bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400">Total Tickets Sold</h3>
                      <p className="text-3xl font-bold text-white">1,234</p>
                    </div>
                    <div className="bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400">Revenue</h3>
                      <p className="text-3xl font-bold text-white">₹10,25,000</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Create New Event</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white mb-2">Event Title</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Date & Time</label>
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white mb-2">Description</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Event
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'manage' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Manage Events</h2>
                  <div className="space-y-4">
                    {/* Placeholder for event list */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white">Sample Event</h3>
                      <p className="text-gray-400">Date: 2025-01-01</p>
                      <div className="mt-4 flex space-x-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">Edit</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400">Delete</button>
                      </div>
                    </div>
                  </div>
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