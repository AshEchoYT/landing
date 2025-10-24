import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Users, Building2 } from "lucide-react";

interface Seat {
  id: string;
  row: string;
  number: number;
  category: "vip" | "fan-pit" | "general" | "balcony";
  status: "available" | "reserved" | "sold";
  price: number;
}

interface SeatMapProps {
  eventId: string;
  selectedSeats?: Seat[];
  onSeatSelect: (seats: Seat[]) => void;
}

export function SeatMap({ eventId, selectedSeats: externalSelectedSeats = [], onSeatSelect }: SeatMapProps) {
  const [internalSelectedSeats, setInternalSelectedSeats] = useState<string[]>([]);

  // Use external selected seats if provided, otherwise use internal state
  const selectedSeats = externalSelectedSeats.length > 0 
    ? externalSelectedSeats.map(s => s.id) 
    : internalSelectedSeats;

  // Mock seat data - todo: remove mock functionality
  const rows = ["VIP", "Fan Pit 1", "Fan Pit 2", "Fan Pit 3", "Fan Pit 4", "General"];

  const seats: Seat[] = useMemo(() => rows.flatMap((row, rowIndex) => {
    const isVip = row === "VIP";
    const isFanPit = row.startsWith("Fan Pit");
    const category = isVip ? "vip" : isFanPit ? "fan-pit" : "general";
    const price = isVip ? 250 : isFanPit ? 180 : 120;

    return Array.from({ length: 10 }, (_, i) => {
      const rand = Math.random();
      return {
        id: `${row.toLowerCase().replace(' ', '-')}-${i}`,
        row,
        number: i + 1,
        category: category as Seat["category"],
        status: rand < 0.1 ? "sold" : rand < 0.2 ? "reserved" : "available",
        price,
      };
    });
  }), []);

  const toggleSeat = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === "sold") return;

    if (externalSelectedSeats.length > 0) {
      // If using external state, call onSeatSelect directly
      const isCurrentlySelected = externalSelectedSeats.some(s => s.id === seatId);
      const newSelection = isCurrentlySelected
        ? externalSelectedSeats.filter(s => s.id !== seatId)
        : [...externalSelectedSeats, seat];
      onSeatSelect(newSelection);
    } else {
      // Use internal state
      setInternalSelectedSeats(prev => {
        const newSelected = prev.includes(seatId)
          ? prev.filter(id => id !== seatId)
          : [...prev, seatId];
        
        // Call onSeatSelect with the updated selection
        const selectedSeatObjects = seats.filter(s => newSelected.includes(s.id));
        onSeatSelect(selectedSeatObjects);
        
        return newSelected;
      });
    }
  };

  const categories = [
    { name: "VIP", icon: Crown, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
    { name: "Fan Pit", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30" },
    { name: "General", icon: Users, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
    { name: "Balcony", icon: Building2, color: "text-indigo-400", bg: "bg-indigo-500/20", border: "border-indigo-500/30" },
  ];

  const getSeatColor = (seat: Seat, isSelected: boolean) => {
    if (isSelected) return "bg-gradient-to-br from-green-400 to-green-500 border-green-400 text-black scale-110 shadow-lg shadow-green-500/50";
    if (seat.status === "sold") return "bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed";
    if (seat.status === "reserved") return "bg-yellow-500/30 border-yellow-500/50 text-yellow-400 animate-pulse";

    const categoryColors = {
      vip: "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30 text-purple-400",
      "fan-pit": "bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-400",
      general: "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-400",
      balcony: "bg-indigo-500/20 border-indigo-500/40 hover:bg-indigo-500/30 text-indigo-400",
    };

    return categoryColors[seat.category];
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 shadow-2xl">
      {/* Neon Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-green-400/20 rounded-2xl blur-xl -z-10"></div>
      <div className="mb-6">
        <h3 className="text-2xl font-heading font-bold mb-4 text-white">Select Your Seats</h3>

        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <Badge key={cat.name} className={`${cat.bg} ${cat.border} ${cat.color}`}>
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg text-center border border-green-500/20">
        <div className="text-sm text-gray-300 mb-2 font-semibold">STAGE</div>
        <div className="h-3 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 rounded-full shadow-lg shadow-green-500/30" />
      </div>

      <div className="space-y-4 mb-6">
        {rows.map(row => {
          const rowSeats = seats.filter(seat => seat.row === row);

          return (
            <div key={row} className="flex items-center gap-2">
              <div className="w-16 text-sm font-medium text-gray-300 truncate">{row}</div>
              <div className="flex-1 grid grid-cols-10 gap-2">
                {rowSeats.map(seat => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat.id)}
                      className={`
                        w-10 h-10 rounded-md border-2 transition-all duration-200 text-xs font-medium
                        ${getSeatColor(seat, isSelected)}
                        ${seat.status !== "sold" ? "hover:scale-105 hover:shadow-lg" : ""}
                      `}
                      style={seat.status === "reserved" ? { animationDuration: '3s' } : {}}
                      disabled={seat.status === "sold"}
                      data-testid={`button-seat-${seat.id}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSeats.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-green-500/20 rounded-lg">
          <div>
            <div className="text-sm text-gray-300">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
            </div>
            <div className="text-2xl font-bold text-green-400" data-testid="text-total-price">
              ${totalPrice}
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-semibold shadow-lg shadow-green-500/30" data-testid="button-proceed-checkout">
            Proceed to Checkout
          </Button>
        </div>
      )}
    </div>
  );
}