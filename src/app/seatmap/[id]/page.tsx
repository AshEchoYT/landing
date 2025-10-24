'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Zap, Ticket, ArrowUpCircle, Clock, ArrowRight } from 'lucide-react';
import { seatMapApi } from '../../../api/seatMapApi';
import { useSeatStore } from '../../../store/useSeatStore';
import { formatCountdown, formatPrice } from '../../../utils/formatters';
import { SeatMap } from '../../../components/SeatMap';
import Loader from '../../../components/Loader';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { convertBackendSeatToFrontend } from '../../../types/seat';

const SeatSelectionPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [seatMap, setSeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [localSelectedSeats, setLocalSelectedSeats] = useState<any[]>([]);
  const { selectedSeats, reservationId, expiresAt, addSeat, removeSeat, setReservation, clearSeats } = useSeatStore();

  useEffect(() => {
    const fetchSeatMap = async () => {
      if (id) {
        try {
          const data = await seatMapApi.getSeatmap(id as string);
          // The API returns seatmap data with availability info, not individual seats
          // For now, we'll create mock seat data based on the venue capacity
          const venueCapacity = data.data.seatmap.seats.total;
          const occupiedSeats = data.data.seatmap.seats.occupiedSeats;
          
          // Create mock seats for display (this should be replaced with actual seat layout from backend)
          const mockSeats = Array.from({ length: venueCapacity }, (_, i) => {
            const seatNo = i + 1;
            const isOccupied = occupiedSeats.includes(seatNo);
            const row = Math.floor((seatNo - 1) / 10) + 1;
            const seatNumber = ((seatNo - 1) % 10) + 1;
            let rowName: string;
            let category: 'vip' | 'fan-pit' | 'general' | 'balcony';
            
            if (row === 1) {
              rowName = "VIP";
              category = "vip";
            } else if (row <= 5) {
              rowName = `Fan Pit ${row - 1}`;
              category = "fan-pit";
            } else {
              rowName = "General";
              category = "general";
            }
            
            return {
              id: `${rowName.toLowerCase().replace(' ', '-')}-${seatNumber}`,
              row: rowName,
              number: seatNumber,
              category,
              status: isOccupied ? 'sold' : 'available',
              price: category === 'vip' ? 20800 : category === 'fan-pit' ? 15000 : 10000
            };
          });
          
          setSeatMap({
            ...data.data.seatmap,
            seats: mockSeats
          });
        } catch (error) {
          console.error('Error fetching seat map:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSeatMap();
  }, [id]);

  // Sync global store with local state on mount
  useEffect(() => {
    if (selectedSeats.length > 0) {
      setLocalSelectedSeats(selectedSeats);
    }
  }, [selectedSeats]);

  // Helper function to assign categories based on row
  const getCategoryFromRow = (row: string) => {
    const rowNum = parseInt(row);
    if (rowNum <= 2) return 'vip';
    if (rowNum <= 5) return 'fan-pit';
    if (rowNum <= 8) return 'general';
    return 'balcony';
  };

  const handleSeatClick = async (seat: any) => {
    // Since we're using the SeatMap component's internal state management,
    // we don't need to handle individual seat clicks here anymore
    // The SeatMap component handles selection internally and calls onSeatSelect
  };

  const totalPrice = localSelectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,197,94,0.05),transparent,rgba(6,182,212,0.05),transparent)] animate-spin" style={{animationDuration: '25s'}}></div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Select Your Seats
            </h1>
            <p className="text-gray-400 text-lg">Choose the perfect spot for an unforgettable experience</p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Stage */}
            <motion.div
              className="xl:col-span-4 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20 shadow-2xl">
                {/* Neon Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl"></div>

                <div className="relative text-center">
                  <motion.div
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-cyan-500/20 px-6 py-3 rounded-full mb-6 border border-green-500/30"
                    animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3)', '0 0 40px rgba(34,197,94,0.6)', '0 0 20px rgba(34,197,94,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-bold text-lg">LIVE STAGE</span>
                    <Zap className="w-6 h-6 text-green-400" />
                  </motion.div>

                  <div className="relative">
                    <div className="w-full h-20 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 rounded-xl shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-black font-bold text-xl tracking-wider">PERFORMANCE AREA</span>
                      </div>
                    </div>

                    {/* Stage Lights Effect */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Seat Grid */}
            <motion.div
              className="xl:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Venue Layout</h2>
                  <motion.button
                    onClick={() => setShowLegend(!showLegend)}
                    className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Legend
                  </motion.button>
                </div>

                {/* Legend */}
                <AnimatePresence>
                  {showLegend && (
                    <motion.div
                      className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gray-700 rounded"></div>
                          <span className="text-gray-300">Available</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-green-400">Selected</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span className="text-yellow-400">Reserved</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gray-600 rounded"></div>
                          <span className="text-gray-400">Sold</span>
                        </div>
                      </div>

                      {/* Category Legend */}
                      <div className="mt-4 pt-4 border-t border-gray-600/50">
                        <h4 className="text-white font-semibold mb-3">Categories & Pricing</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                            <Crown className="w-4 h-4 text-purple-400" />
                            <div>
                              <span className="text-purple-400 font-medium">VIP</span>
                              <p className="text-xs text-gray-400">{formatPrice(20800)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <div>
                              <span className="text-cyan-400 font-medium">Fan Pit</span>
                              <p className="text-xs text-gray-400">{formatPrice(15000)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                            <Ticket className="w-4 h-4 text-green-400" />
                            <div>
                              <span className="text-green-400 font-medium">General</span>
                              <p className="text-xs text-gray-400">{formatPrice(10000)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                            <ArrowUpCircle className="w-4 h-4 text-indigo-400" />
                            <div>
                              <span className="text-indigo-400 font-medium">Balcony</span>
                              <p className="text-xs text-gray-400">{formatPrice(12500)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <SeatMap
                  eventId={id}
                  selectedSeats={selectedSeats.map(seat => convertBackendSeatToFrontend(seat.seatNo, seat.category, seat.price, seat.status))}
                  onSeatSelect={(seats) => {
                    // Update local state
                    setLocalSelectedSeats(seats);
                    // Convert Seat[] to BackendSeat[] for store
                    clearSeats();
                    seats.forEach(seat => {
                      // Convert back to BackendSeat format
                      const backendSeat = {
                        seatNo: (seat.row === 'VIP' ? 0 : seat.row.includes('Fan Pit') ? (parseInt(seat.row.split(' ')[2]) - 1) * 10 : 40) + seat.number,
                        status: seat.status,
                        price: seat.price,
                        category: seat.category
                      };
                      addSeat(backendSeat);
                    });
                  }}
                />
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div
              className="xl:col-span-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 shadow-2xl sticky top-24">
                {/* Neon Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl -z-10"></div>

                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Users className="w-6 h-6 text-green-400" />
                    <span>Booking Summary</span>
                  </h3>

                  {localSelectedSeats.length > 0 ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="space-y-3">
                        {localSelectedSeats.map((seat, index) => (
                          <motion.div
                            key={seat.id}
                            className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              {/* Category Icon */}
                              {seat.category === 'vip' && <Crown className="w-4 h-4 text-purple-400" />}
                              {seat.category === 'fan-pit' && <Zap className="w-4 h-4 text-cyan-400" />}
                              {seat.category === 'general' && <Ticket className="w-4 h-4 text-green-400" />}
                              {seat.category === 'balcony' && <ArrowUpCircle className="w-4 h-4 text-indigo-400" />}
                              
                              <div>
                                <span className="text-white font-medium">Seat {seat.row}{seat.number}</span>
                                <p className="text-xs text-gray-400 capitalize">{seat.category.replace('-', ' ')}</p>
                              </div>
                            </div>
                            <span className="text-green-400 font-semibold">{formatPrice(seat.price)}</span>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        className="border-t border-gray-600/50 pt-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex justify-between text-xl font-bold text-white mb-4">
                          <span>Total</span>
                          <span className="text-green-400">{formatPrice(totalPrice)}</span>
                        </div>

                        {expiresAt && (
                          <motion.div
                            className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30 mb-4"
                            animate={{ boxShadow: ['0 0 0 rgba(234,179,8,0)', '0 0 20px rgba(234,179,8,0.3)', '0 0 0 rgba(234,179,8,0)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">Reservation Timer</span>
                            </div>
                            <div className="text-white font-mono text-lg">
                              {formatCountdown(new Date(expiresAt))}
                            </div>
                          </motion.div>
                        )}

                        <motion.button
                          onClick={async () => {
                            try {
                              // For now, reserve the first seat as an example
                              // TODO: Handle multiple seat reservations properly
                              const firstSeat = localSelectedSeats[0];
                              if (firstSeat) {
                                const reservation = await seatMapApi.reserveSeat({
                                  eventId: id as string,
                                  seatNo: firstSeat.seatNo || 1, // Need to calculate seatNo properly
                                  attendeeId: 'current-user-id', // TODO: Get from auth context
                                });
                                setReservation(reservation.data.reservationId, reservation.data.expiresAt);
                                
                                // Sync selected seats to global store
                                clearSeats(); // Clear any existing seats first
                                localSelectedSeats.forEach(seat => addSeat(seat));
                                
                                router.push('/checkout');
                              }
                            } catch (error) {
                              console.error('Error creating reservation:', error);
                            }
                          }}
                          className="group relative w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center space-x-3">
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg">No seats selected</p>
                      <p className="text-gray-500 text-sm mt-2">Click on seats to get started</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeatSelectionPage;