'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ticketsApi } from '../../api/ticketsApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/formatters';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Ticket {
  id: string;
  event: {
    title: string;
    date: string;
    venue: string;
    image: string;
  };
  seat: {
    row: string;
    number: number;
  };
  qrCode: string;
}

const MyTicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (user?.id) {
        try {
          const data = await ticketsApi.getUserTickets(user.id);
          setTickets(data);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTickets();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-3xl font-bold text-center mb-8 text-green-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            My Tickets
          </motion.h1>

          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img src={ticket.event.image} alt={ticket.event.title} className="w-full h-32 object-cover rounded mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{ticket.event.title}</h3>
                  <p className="text-gray-300 mb-2">{formatDate(ticket.event.date)} at {formatTime(ticket.event.date)}</p>
                  <p className="text-gray-300 mb-2">Venue: {ticket.event.venue}</p>
                  <p className="text-gray-300 mb-4">Seat: {ticket.seat.row}{ticket.seat.number}</p>
                  <div className="text-center">
                    <img src={ticket.qrCode} alt="QR Code" className="w-24 h-24 mx-auto mb-4" />
                    <button className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 transition-colors">
                      Download Ticket
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-white mb-4">No Tickets Yet</h2>
              <p className="text-gray-400 mb-6">You haven't booked any tickets. Start exploring events!</p>
              <a
                href="/events"
                className="bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
              >
                Explore Events
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyTicketsPage;