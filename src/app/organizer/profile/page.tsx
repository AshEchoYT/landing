"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Bell,
  BellOff,
  Edit3,
  Save,
  X,
  Building,
  Globe,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Star,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/Loader';
import Navbar from '../../../components/Navbar';
import { organizerApi, Organizer, UpdateOrganizerProfileData } from '../../../api/organizerApi';

const OrganizerProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateOrganizerProfileData>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await organizerApi.getProfile();
        if (response.success) {
          setProfile(response.data.organizer);
          setEditForm({
            name: response.data.organizer.name,
            phoneNumbers: response.data.organizer.phoneNumbers || [],
            companyName: response.data.organizer.companyName || '',
            website: response.data.organizer.website || '',
            description: response.data.organizer.description || '',
            address: response.data.organizer.address || {},
            socialMedia: response.data.organizer.socialMedia || {},
            preferences: response.data.organizer.preferences
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

    if (user && user.role === 'organizer') {
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      setError(null);

      const response = await organizerApi.updateProfile(editForm);
      if (response.success) {
        setProfile(response.data.organizer);
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
        companyName: profile.companyName || '',
        website: profile.website || '',
        description: profile.description || '',
        address: profile.address || {},
        socialMedia: profile.socialMedia || {},
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

  const handleAddressChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const toggleNotification = (type: 'email' | 'sms' | 'push') => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          email: prev.preferences?.notifications?.email ?? false,
          sms: prev.preferences?.notifications?.sms ?? false,
          push: prev.preferences?.notifications?.push ?? false,
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

  if (!user || user.role !== 'organizer' || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-400 text-xl mb-4">Access Denied</div>
            <p className="text-gray-400">You need organizer permissions to view this profile.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
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
              Organizer Profile
            </motion.h1>
            <p className="text-xl text-gray-400">
              Manage your organizer account and business information
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

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.companyName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Building className="w-5 h-5 text-green-400" />
                        <span className="text-white">{profile.companyName || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.website || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Globe className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          {profile.website ? (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                              {profile.website}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-700/30 rounded-lg">
                        <span className="text-white">{profile.description || 'No description provided'}</span>
                      </div>
                    )}
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

              {/* Address Information */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Address Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                        {field === 'zipCode' ? 'ZIP Code' : field}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.address?.[field as keyof typeof editForm.address] || ''}
                          onChange={(e) => handleAddressChange(field, e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-400" />
                          <span className="text-white">
                            {profile.address?.[field as keyof typeof profile.address] || 'Not specified'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Social Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'facebook', label: 'Facebook', icon: Facebook },
                    { key: 'twitter', label: 'Twitter', icon: Twitter },
                    { key: 'instagram', label: 'Instagram', icon: Instagram },
                    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.socialMedia?.[key as keyof typeof editForm.socialMedia] || ''}
                          onChange={(e) => handleSocialMediaChange(key, e.target.value)}
                          placeholder={`https://${key}.com/yourprofile`}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                          <Icon className="w-5 h-5 text-green-400" />
                          <span className="text-white">
                            {profile.socialMedia?.[key as keyof typeof profile.socialMedia] ? (
                              <a
                                href={profile.socialMedia[key as keyof typeof profile.socialMedia]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300"
                              >
                                {label}
                              </a>
                            ) : (
                              'Not connected'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive updates via text message' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isEditing ? (
                          editForm.preferences?.notifications?.[key as keyof typeof editForm.preferences.notifications] ? (
                            <Bell className="w-5 h-5 text-green-400" />
                          ) : (
                            <BellOff className="w-5 h-5 text-gray-400" />
                          )
                        ) : (
                          profile.preferences.notifications[key as keyof typeof profile.preferences.notifications] ? (
                            <Bell className="w-5 h-5 text-green-400" />
                          ) : (
                            <BellOff className="w-5 h-5 text-gray-400" />
                          )
                        )}
                        <div>
                          <p className="text-white font-medium">{label}</p>
                          <p className="text-gray-400 text-sm">{desc}</p>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => toggleNotification(key as 'email' | 'sms' | 'push')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            editForm.preferences?.notifications?.[key as keyof typeof editForm.preferences.notifications] ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              editForm.preferences?.notifications?.[key as keyof typeof editForm.preferences.notifications] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Status */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Verification Status</h3>
                <div className="flex items-center space-x-3">
                  {profile.isVerified ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-green-400 font-semibold">Verified Organizer</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Pending Verification</span>
                    </>
                  )}
                </div>
                {!profile.isVerified && (
                  <p className="text-gray-400 text-sm mt-2">
                    Complete your profile and submit verification documents to get verified.
                  </p>
                )}
              </motion.div>

              {/* Account Statistics */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Account Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Events:</span>
                    <span className="text-white font-semibold">{profile.totalEvents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{profile.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${profile.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
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
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/organizer">
                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <span className="text-white">View My Events</span>
                    </button>
                  </Link>
                  <Link href="/organizer?tab=staff">
                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                      <Building className="w-5 h-5 text-green-400" />
                      <span className="text-white">Manage Staff</span>
                    </button>
                  </Link>
                  <Link href="/organizer?tab=overview">
                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-left">
                      <Star className="w-5 h-5 text-green-400" />
                      <span className="text-white">View Analytics</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfilePage;