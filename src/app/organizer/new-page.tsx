'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { eventsApi, CreateEventData, Event } from '../../api/eventsApi';
import { venueApi, Venue } from '../../api/venueApi';
import { organizerApi, StaffMember, Sponsor, Vendor } from '../../api/organizerApi';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Check,
  Edit3,
  Trash2,
  Eye,
  Building,
  Truck,
  Award,
  BarChart3,
  Settings,
  Save,
  UserCheck
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();

  // Check if user is an organizer BEFORE any hooks
  if (!user || user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 text-xl">You need organizer permissions to access this dashboard.</p>
          <p className="text-gray-400 mt-4">Please contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    capacity: 500, // Predefined capacity
    pricing: [{ category: 'standard', price: 0 }],
    tags: [],
    image: '',
    staff: [],
    sponsors: []
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[]
  });

  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    email: '',
    company: '',
    sponsorshipLevel: '',
    amount: 0,
    benefits: [] as string[]
  });

  const [selectedVenueVendors, setSelectedVenueVendors] = useState<Vendor[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Modal states
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'create', label: 'Create Event', icon: Plus },
    { id: 'manage', label: 'Manage Events', icon: Settings },
    { id: 'staff', label: 'Add Staff', icon: UserCheck },
    { id: 'sponsors', label: 'Add Sponsors', icon: Building },
  ];

  // Fetch functions
  const fetchDashboardData = async () => {
    try {
      const response = await organizerApi.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await venueApi.getVenues();
      if (response.success) {
        setVenues(response.data.venues);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await organizerApi.getStaff();
      if (response.success) {
        setStaff(response.data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchSponsors = async () => {
    try {
      const response = await organizerApi.getSponsors();
      if (response.success) {
        setSponsors(response.data.sponsors);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await organizerApi.getVendors();
      if (response.success) {
        setVendors(response.data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
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

  // Initialize data
  useEffect(() => {
    fetchDashboardData();
    fetchVenues();
    fetchStaff();
    fetchSponsors();
    fetchVendors();

    if (activeTab === 'manage' && user?._id) {
      fetchMyEvents();
    }
  }, [activeTab, user?._id]);

  // Form handlers
  const handleEventFormChange = (field: keyof CreateEventData, value: any) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handleVenueChange = (venueId: string) => {
    handleEventFormChange('venue', venueId);

    // Find selected venue and get its associated vendors
    const selectedVenue = venues.find(v => v._id === venueId);
    if (selectedVenue && selectedVenue.vendors) {
      setSelectedVenueVendors(selectedVenue.vendors);
    } else {
      setSelectedVenueVendors([]);
    }
  };

  const handleStaffAssignment = (staffId: string, role: string, checked: boolean) => {
    if (checked) {
      setEventForm(prev => ({
        ...prev,
        staff: [...prev.staff, { staffId, role }]
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        staff: prev.staff.filter(s => s.staffId !== staffId)
      }));
    }
  };

  const handleSponsorAssignment = (sponsorId: string, contributionAmount: number, sponsorshipType: string, perks: string[], checked: boolean) => {
    if (checked) {
      setEventForm(prev => ({
        ...prev,
        sponsors: [...prev.sponsors, { sponsorId, contributionAmount, sponsorshipType, perks }]
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        sponsors: prev.sponsors.filter(s => s.sponsorId !== sponsorId)
      }));
    }
  };

  const handleVendorAssignment = (vendorId: string, contractAmount: number, checked: boolean) => {
    // For now, we'll store vendor assignments in a separate state or extend the form
    // This would need backend support for vendor assignments
    console.log('Vendor assignment:', vendorId, contractAmount, checked);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleEventFormChange('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await eventsApi.createEvent(eventForm);
      if (response.success) {
        alert('Event created successfully!');
        // Reset form
        setEventForm({
          title: '',
          description: '',
          date: '',
          venue: '',
          category: '',
          capacity: 500,
          pricing: [{ category: 'standard', price: 0 }],
          tags: [],
          image: '',
          staff: [],
          sponsors: []
        });
        setImagePreview(null);
        setSelectedVenueVendors([]);
        fetchMyEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting staff form:', staffForm);
      const response = await organizerApi.addStaffMember(staffForm);
      console.log('Staff API response:', response);

      if (response.success) {
        console.log('Staff added successfully:', response.data.staff);
        // Clear form
        setStaffForm({ name: '', email: '', role: '', permissions: [] });
        // Refresh staff list from server
        await fetchStaff();
        alert('Staff member added successfully!');
      } else {
        console.error('Staff API returned success=false:', response);
        alert('Failed to add staff member: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff member. Check console for details.');
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting sponsor form:', sponsorForm);
      const response = await organizerApi.addSponsor(sponsorForm);
      console.log('Sponsor API response:', response);

      if (response.success) {
        console.log('Sponsor added successfully:', response.data.sponsor);
        // Clear form
        setSponsorForm({ name: '', email: '', company: '', sponsorshipLevel: '', amount: 0, benefits: [] });
        // Refresh sponsors list from server
        await fetchSponsors();
        alert('Sponsor added successfully!');
      } else {
        console.error('Sponsor API returned success=false:', response);
        alert('Failed to add sponsor: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
      alert('Failed to add sponsor. Check console for details.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsApi.deleteEvent(eventId);
        fetchMyEvents();
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Organizer Dashboard
            </h1>
            <p className="text-gray-300 text-xl">Manage your events, staff, and sponsors</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <motion.div
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 text-sm font-semibold">Total Events</p>
                      <p className="text-white text-3xl font-bold">{dashboardData?.metrics?.totalEvents || 0}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-cyan-400 text-sm font-semibold">Tickets Sold</p>
                      <p className="text-white text-3xl font-bold">{dashboardData?.metrics?.totalTicketsSold || 0}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">Total Revenue</p>
                      <p className="text-white text-3xl font-bold">₹{(dashboardData?.metrics?.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                      <Building className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-400 text-sm font-semibold">Active Events</p>
                      <p className="text-white text-3xl font-bold">{dashboardData?.metrics?.activeEvents || 0}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Create Event Tab */}
            {activeTab === 'create' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl font-bold text-white mb-8 text-center">Create New Event</h2>

                  <form onSubmit={handleCreateEvent} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 shadow-2xl">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                        <Calendar className="w-6 h-6 text-green-400" />
                        <span>Basic Information</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white font-semibold mb-2">Event Title</label>
                          <input
                            type="text"
                            value={eventForm.title}
                            onChange={(e) => handleEventFormChange('title', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2">Category</label>
                          <select
                            value={eventForm.category}
                            onChange={(e) => handleEventFormChange('category', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="music">Music</option>
                            <option value="tech">Technology</option>
                            <option value="sports">Sports</option>
                            <option value="business">Business</option>
                            <option value="entertainment">Entertainment</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2">Date & Time</label>
                          <input
                            type="datetime-local"
                            value={eventForm.date}
                            onChange={(e) => handleEventFormChange('date', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2">Venue</label>
                          <select
                            value={eventForm.venue}
                            onChange={(e) => handleVenueChange(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                            required
                          >
                            <option value="">Select Venue</option>
                            {venues.map((venue) => (
                              <option key={venue._id} value={venue._id}>{venue.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-white font-semibold mb-2">Description</label>
                        <textarea
                          value={eventForm.description}
                          onChange={(e) => handleEventFormChange('description', e.target.value)}
                          rows={4}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="mt-6">
                        <label className="block text-white font-semibold mb-2">Event Image</label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-3 rounded-xl cursor-pointer transition-colors">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-300">Choose Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          {imagePreview && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-600">
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                        <DollarSign className="w-6 h-6 text-cyan-400" />
                        <span>Pricing Tiers</span>
                      </h3>

                      <div className="space-y-4">
                        {eventForm.pricing.map((tier, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <select
                              value={tier.category}
                              onChange={(e) => {
                                const newPricing = [...eventForm.pricing];
                                newPricing[index].category = e.target.value;
                                handleEventFormChange('pricing', newPricing);
                              }}
                              className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                            >
                              <option value="standard">Standard</option>
                              <option value="vip">VIP</option>
                              <option value="premium">Premium</option>
                            </select>

                            <input
                              type="number"
                              placeholder="Price"
                              value={tier.price}
                              onChange={(e) => {
                                const newPricing = [...eventForm.pricing];
                                newPricing[index].price = Number(e.target.value);
                                handleEventFormChange('pricing', newPricing);
                              }}
                              className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                            />

                            {eventForm.pricing.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPricing = eventForm.pricing.filter((_, i) => i !== index);
                                  handleEventFormChange('pricing', newPricing);
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            handleEventFormChange('pricing', [...eventForm.pricing, { category: 'standard', price: 0 }]);
                          }}
                          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add Pricing Tier</span>
                        </button>
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Staff Assignment */}
                      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20 shadow-2xl">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <UserCheck className="w-5 h-5 text-green-400" />
                          <span>Assign Staff</span>
                        </h4>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {staff.map((member) => (
                            <div key={member._id} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                onChange={(e) => handleStaffAssignment(member._id, member.role, e.target.checked)}
                                className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                              />
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{member.name}</p>
                                <p className="text-gray-400 text-xs">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sponsor Assignment */}
                      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/20 shadow-2xl">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <Building className="w-5 h-5 text-cyan-400" />
                          <span>Assign Sponsors</span>
                        </h4>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {sponsors.map((sponsor) => (
                            <div key={sponsor._id} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                onChange={(e) => handleSponsorAssignment(sponsor._id, sponsor.amount, sponsor.sponsorshipLevel, sponsor.benefits, e.target.checked)}
                                className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400"
                              />
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{sponsor.name}</p>
                                <p className="text-gray-400 text-xs">{sponsor.company}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vendor Assignment */}
                      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <Truck className="w-5 h-5 text-purple-400" />
                          <span>Venue Vendors</span>
                        </h4>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedVenueVendors.length > 0 ? (
                            selectedVenueVendors.map((vendor) => (
                              <div key={vendor._id} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  onChange={(e) => handleVendorAssignment(vendor._id, vendor.contractValue, e.target.checked)}
                                  className="w-4 h-4 text-purple-400 bg-gray-700 border-gray-600 rounded focus:ring-purple-400"
                                />
                                <div className="flex-1">
                                  <p className="text-white text-sm font-medium">{vendor.name}</p>
                                  <p className="text-gray-400 text-xs">{vendor.serviceType}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-sm">Select a venue to see available vendors</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating Event...' : 'Create Event'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Manage Events Tab */}
            {activeTab === 'manage' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Manage Events</h2>
                </div>

                {myEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myEvents.map((event, index) => (
                      <motion.div
                        key={event._id}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-600 shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {event.image && (
                          <div className="h-48 overflow-hidden">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-gray-400 text-sm mb-4">{new Date(event.date).toLocaleDateString()}</p>

                          <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                            <span>Capacity: {event.capacity}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              event.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              event.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {event.status}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setShowEditEventModal(true);
                              }}
                              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                    <p className="text-gray-400">Create your first event to get started</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Add Staff Tab */}
            {activeTab === 'staff' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Add Staff Member</h2>

                <form onSubmit={handleAddStaff} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 shadow-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">Full Name</label>
                      <input
                        type="text"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Role</label>
                      <select
                        value={staffForm.role}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="manager">Manager</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="technician">Technician</option>
                        <option value="security">Security</option>
                        <option value="usher">Usher</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Permissions</label>
                      <div className="space-y-2">
                        {['manage_events', 'view_analytics', 'manage_staff', 'manage_sponsors'].map((permission) => (
                          <label key={permission} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={staffForm.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStaffForm(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                                } else {
                                  setStaffForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                                }
                              }}
                              className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                            />
                            <span className="text-gray-300 capitalize">{permission.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300"
                    >
                      Add Staff Member
                    </button>
                  </div>
                </form>

                {/* Staff List */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white mb-6">Current Staff</h3>
                  {staff.length > 0 ? (
                    <div className="space-y-4">
                      {staff.map((member) => (
                        <div key={member._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">{member.name}</p>
                              <p className="text-gray-400 text-sm">{member.email} • {member.role}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No staff members added yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Add Sponsors Tab */}
            {activeTab === 'sponsors' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Add Sponsor</h2>

                <form onSubmit={handleAddSponsor} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={sponsorForm.name}
                        onChange={(e) => setSponsorForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={sponsorForm.email}
                        onChange={(e) => setSponsorForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Company</label>
                      <input
                        type="text"
                        value={sponsorForm.company}
                        onChange={(e) => setSponsorForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Sponsorship Level</label>
                      <select
                        value={sponsorForm.sponsorshipLevel}
                        onChange={(e) => setSponsorForm(prev => ({ ...prev, sponsorshipLevel: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        required
                      >
                        <option value="">Select Level</option>
                        <option value="platinum">Platinum</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="bronze">Bronze</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Contribution Amount (₹)</label>
                      <input
                        type="number"
                        value={sponsorForm.amount}
                        onChange={(e) => setSponsorForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">Benefits</label>
                      <div className="space-y-2">
                        {['logo_on_website', 'booth_space', 'social_media', 'email_blast', 'event_mention'].map((benefit) => (
                          <label key={benefit} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={sponsorForm.benefits.includes(benefit)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSponsorForm(prev => ({ ...prev, benefits: [...prev.benefits, benefit] }));
                                } else {
                                  setSponsorForm(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
                                }
                              }}
                              className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400"
                            />
                            <span className="text-gray-300 capitalize">{benefit.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
                    >
                      Add Sponsor
                    </button>
                  </div>
                </form>

                {/* Sponsors List */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white mb-6">Current Sponsors</h3>
                  {sponsors.length > 0 ? (
                    <div className="space-y-4">
                      {sponsors.map((sponsor) => (
                        <div key={sponsor._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">{sponsor.name}</p>
                              <p className="text-gray-400 text-sm">{sponsor.company} • {sponsor.sponsorshipLevel}</p>
                            </div>
                            <span className="text-cyan-400 font-semibold">₹{sponsor.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No sponsors added yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;