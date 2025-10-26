import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate, formatPrice } from '../utils/formatters';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { Event } from '../api/eventsApi';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Calculate available seats from capacity and analytics
  const availableSeats = event.capacity - event.analytics.attendees;
  const availabilityPercentage = (availableSeats / event.capacity) * 100;
  
  // Get the lowest price from pricing array
  const lowestPrice = event.pricing.length > 0 ? Math.min(...event.pricing.map(p => p.price)) : 0;

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-green-500/50 transition-shadow duration-150 group relative transform will-change-transform"
      whileHover={{ y: -10, scale: 1.05, boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 1200, damping: 60 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(34, 197, 94, 0.05), rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05))',
            'linear-gradient(225deg, rgba(34, 197, 94, 0.05), rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05))',
            'linear-gradient(45deg, rgba(34, 197, 94, 0.05), rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05))'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative overflow-hidden">
        <motion.img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-100 ease-out will-change-transform"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-100 ease-out" />

        {/* Floating elements */}
        <motion.div
          className="absolute top-4 left-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
        </motion.div>

        {/* Price badge with enhanced animation */}
        <motion.div
          className="absolute top-4 right-4 bg-gradient-to-r from-green-500/90 to-cyan-500/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-bold border border-white/20 shadow-lg"
          initial={{ scale: 0, rotate: 180 }}
          animate={{
            scale: 1,
            rotate: 0,
            boxShadow: [
              '0 0 0 rgba(34, 197, 94, 0.4)',
              '0 0 20px rgba(34, 197, 94, 0.4)',
              '0 0 0 rgba(34, 197, 94, 0.4)'
            ]
          }}
          transition={{
            delay: 0.4,
            type: 'spring',
            stiffness: 200,
            boxShadow: { duration: 2, repeat: Infinity }
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
            rotate: [0, -5]
          }}
        >
          {formatPrice(lowestPrice)}
        </motion.div>

        {/* Availability indicator */}
        <motion.div
          className="absolute bottom-4 left-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-green-400" />
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-cyan-400 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
                  transition={{ delay: 0.7, duration: 1 }}
                />
              </div>
              <span className="text-xs text-white font-medium">
                {Math.round(availabilityPercentage)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-6 relative z-10">
        <motion.h3
          className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-100 ease-out"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          {event.title}
        </motion.h3>

        <motion.p
          className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {event.description}
        </motion.p>

        <motion.div
          className="flex justify-between items-center mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 text-green-400 font-semibold">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Calendar className="w-4 h-4" />
            </motion.div>
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.venue?.name || 'TBA'}</span>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {event.tags.slice(0, 3).map((tag, index) => (
            <motion.span
              key={tag}
              className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 200
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                rotate: [0, -2]
              }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href={`/events/${event._id}`}>
            <motion.button
              className="w-full bg-gradient-to-r from-green-500 via-green-400 to-cyan-500 text-black py-3 rounded-lg font-semibold hover:from-green-400 hover:via-cyan-400 hover:to-purple-500 transition-all duration-150 shadow-lg hover:shadow-green-500/50 relative overflow-hidden group"
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-100 ease-out"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              <span className="relative z-10">View Details</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventCard;