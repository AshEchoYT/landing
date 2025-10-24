import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Ticket, ArrowUpCircle } from 'lucide-react';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  category: 'vip' | 'fan-pit' | 'general' | 'balcony';
}

interface SeatGridProps {
  seats: Seat[][];
  selectedSeats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

const SeatGrid: React.FC<SeatGridProps> = ({ seats, selectedSeats, onSeatClick }) => {
  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return 'bg-gradient-to-br from-green-400 to-green-500 shadow-green-500/50';
    if (seat.status === 'sold') return 'bg-gray-600 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50';
    
    // Category-based colors
    switch (seat.category) {
      case 'vip':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400';
      case 'fan-pit':
        return 'bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400';
      case 'general':
        return 'bg-gradient-to-br from-gray-700 to-gray-600 hover:from-green-500 hover:to-green-400';
      case 'balcony':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400';
      default:
        return 'bg-gradient-to-br from-gray-700 to-gray-600 hover:from-cyan-500 hover:to-green-500';
    }
  };

  const getSeatGlow = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return '0 0 20px rgba(34, 197, 94, 0.8)';
    if (seat.status === 'reserved') return '0 0 15px rgba(234, 179, 8, 0.6)';
    
    // Category-based glow
    switch (seat.category) {
      case 'vip':
        return '0 0 10px rgba(147, 51, 234, 0.4)';
      case 'fan-pit':
        return '0 0 10px rgba(6, 182, 212, 0.4)';
      case 'general':
        return '0 0 10px rgba(34, 197, 94, 0.4)';
      case 'balcony':
        return '0 0 10px rgba(99, 102, 241, 0.4)';
      default:
        return 'none';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { className: "w-3 h-3 text-white", strokeWidth: 2.5 };
    switch (category) {
      case 'vip':
        return <Crown {...iconProps} />;
      case 'fan-pit':
        return <Zap {...iconProps} />;
      case 'general':
        return <Ticket {...iconProps} />;
      case 'balcony':
        return <ArrowUpCircle {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Row Labels */}
      <div className="flex mb-4">
        <div className="w-8"></div> {/* Spacer for column numbers */}
        {seats[0]?.map((_, colIndex) => (
          <motion.div
            key={colIndex}
            className="flex-1 text-center text-gray-400 text-sm font-semibold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.02 }}
          >
            {colIndex + 1}
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        {seats.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
          >
            {/* Row Label */}
            <div className="w-8 text-center text-gray-300 font-bold text-sm">
              {String.fromCharCode(65 + rowIndex)}
            </div>

            {/* Seats */}
            <div className="flex space-x-1 flex-1">
              {row.map((seat, colIndex) => (
                <motion.button
                  key={seat.id}
                  className={`relative w-10 h-10 rounded-lg ${getSeatColor(seat)} transition-all duration-300 flex items-center justify-center text-xs font-bold text-black border-2 border-white/20 overflow-hidden`}
                  onClick={() => onSeatClick(seat)}
                  whileHover={{
                    scale: seat.status === 'sold' ? 1 : 1.15,
                    y: seat.status === 'sold' ? 0 : -3,
                    boxShadow: seat.status === 'sold' ? 'none' : '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                  whileTap={{
                    scale: seat.status === 'sold' ? 1 : 0.95,
                    transition: { duration: 0.1 }
                  }}
                  disabled={seat.status === 'sold'}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    boxShadow: getSeatGlow(seat)
                  }}
                  transition={{
                    delay: (rowIndex * row.length + colIndex) * 0.01,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  {/* Animated Background Effect */}
                  {selectedSeats.find(s => s.id === seat.id) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Category Icon */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (rowIndex * row.length + colIndex) * 0.01 + 0.2 }}
                  >
                    {getCategoryIcon(seat.category)}
                  </motion.div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/50 to-green-400/50"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: seat.status === 'sold' ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Selection Pulse */}
                  {selectedSeats.find(s => s.id === seat.id) && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-green-300"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Screen Indicator */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
        <p className="text-gray-400 text-sm">SCREEN</p>
      </motion.div>
    </div>
  );
};

export default SeatGrid;