"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Bell, BellOff, Edit3, Save, X, Calendar, Ticket, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import { attendeeApi, Attendee, UpdateAttendeeProfileData } from '../../api/attendeeApi';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateAttendeeProfileData>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await attendeeApi.getProfile();
        if (response.success) {
          setProfile(response.data.attendee);
          setEditForm({
            name: response.data.attendee.name,
            phoneNumbers: response.data.attendee.phoneNumbers || [],
            preferences: response.data.attendee.preferences
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      setError(null);

      const response = await attendeeApi.updateProfile(editForm);
      if (response.success) {
        setProfile(response.data.attendee);
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phoneNumbers: profile.phoneNumbers || [],
        preferences: profile.preferences
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...(editForm.phoneNumbers || [])];
    newPhoneNumbers[index] = value;
    setEditForm(prev => ({
      ...prev,
      phoneNumbers: newPhoneNumbers
    }));
  };

  const addPhoneNumber = () => {
    setEditForm(prev => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers || []), '']
    }));
  };

  const removePhoneNumber = (index: number) => {
    const newPhoneNumbers = [...(editForm.phoneNumbers || [])];
    newPhoneNumbers.splice(index, 1);
    setEditForm(prev => ({
      ...prev,
      phoneNumbers: newPhoneNumbers
    }));
  };

  const toggleNotification = (type: 'email' | 'sms') => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        categories: prev.preferences?.categories || [],
        notifications: {
          email: prev.preferences?.notifications?.email ?? false,
          sms: prev.preferences?.notifications?.sms ?? false,
          [type]: !(prev.preferences?.notifications?.[type] ?? false)
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-400 text-xl mb-4">Please log in to view your profile</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            My Profile
          </motion.h1>
          <p className="text-xl text-gray-400">
            Manage your account information and preferences
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updating ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <User className="w-5 h-5 text-green-400" />
                      <span className="text-white">{profile.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span className="text-white">{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Numbers</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {(editForm.phoneNumbers || []).map((phone, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                            placeholder="Enter phone number"
                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() => removePhoneNumber(index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addPhoneNumber}
                        className="text-green-400 hover:text-green-300 transition-colors text-sm"
                      >
                        + Add Phone Number
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.phoneNumbers && profile.phoneNumbers.length > 0 ? (
                        profile.phoneNumbers.map((phone, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                            <Phone className="w-5 h-5 text-green-400" />
                            <span className="text-white">{phone}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No phone numbers added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      editForm.preferences?.notifications?.email ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )
                    ) : (
                      profile.preferences.notifications.email ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )
                    )}
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-gray-400 text-sm">Receive updates via email</p>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => toggleNotification('email')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editForm.preferences?.notifications?.email ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editForm.preferences?.notifications?.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      editForm.preferences?.notifications?.sms ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )
                    ) : (
                      profile.preferences.notifications.sms ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )
                    )}
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-gray-400 text-sm">Receive updates via text message</p>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => toggleNotification('sms')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editForm.preferences?.notifications?.sms ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editForm.preferences?.notifications?.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${profile.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white font-semibold capitalize">{profile.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Since:</span>
                  <span className="text-white font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                  <Ticket className="w-5 h-5 text-green-400" />
                  <span className="text-white">View My Tickets</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-white">My Events</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-white">Payment History</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;