import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Users, Building2 } from "lucide-react";
import { formatPrice } from "../utils/formatters";
import { Seat } from "@/types/seat";
import { seatMapApi } from "../api/seatMapApi";
import { useAuth } from "../context/AuthContext";
import {
  getSeatNo,
  getSeatPosition,
  getCategoryFromRow,
  getPriceFromCategory,
  createSeatInfo,
  generateAllSeats,
  SeatInfo
} from "../utils/seatUtils";

interface SeatMapProps {
  eventId: string;
  selectedSeats?: Seat[];
  onSeatSelect: (seats: Seat[]) => void;
  venueCapacity?: number;
  occupiedSeats?: number[];
  reservedSeats?: number[];
  pricing?: Array<{ category: string; price: number }>;
}

export function SeatMap({
  eventId,
  selectedSeats: externalSelectedSeats = [],
  onSeatSelect,
  venueCapacity = 60,
  occupiedSeats = [],
  reservedSeats = [],
  pricing = []
}: SeatMapProps) {
  const [reservations, setReservations] = useState<{[key: string]: {reservationId: string, expiresAt: Date}}>({});
  const { user } = useAuth();

  // Generate all seats for the venue using the new utility
  const allSeats: Seat[] = useMemo(() => {
    const seats: Seat[] = [];
    const rows = ["VIP", "Fan Pit 1", "Fan Pit 2", "Fan Pit 3", "Fan Pit 4", "General"];

    rows.forEach((row) => {
      const category = getCategoryFromRow(row);

      // Get price from pricing prop or use defaults
      const pricingArray = Array.isArray(pricing) ? pricing : [];
      const categoryPricing = pricingArray.find(p => p.category === category);
      const price = categoryPricing ? categoryPricing.price : getPriceFromCategory(category);

      for (let seatNum = 1; seatNum <= 10; seatNum++) {
        const seatNo = getSeatNo(row, seatNum);
        const isOccupied = occupiedSeats.includes(seatNo);
        const isReserved = reservedSeats.includes(seatNo);

        let status: "available" | "reserved" | "sold" = "available";
        if (isOccupied) {
          status = "sold";
        } else if (isReserved) {
          status = "reserved";
        }

        seats.push({
          id: `${row.toLowerCase().replace(' ', '-')}-${seatNum}`,
          row,
          number: seatNum,
          category: category as Seat["category"],
          status,
          price,
        });
      }
    });

    return seats;
  }, [venueCapacity, occupiedSeats, reservedSeats, pricing]);

  // Get selected seat IDs
  const selectedSeatIds = externalSelectedSeats.map(seat => seat.id);

  // Handle seat click
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "sold") return;

    // If seat is reserved by someone else, don't allow selection
    if (seat.status === "reserved" && !reservations[seat.id]) return;

    const isCurrentlySelected = selectedSeatIds.includes(seat.id);
    let newSelection: Seat[];

    if (isCurrentlySelected) {
      // Remove from selection
      newSelection = externalSelectedSeats.filter(s => s.id !== seat.id);
    } else {
      // Add to selection
      newSelection = [...externalSelectedSeats, seat];
    }

    onSeatSelect(newSelection);
  };

  // Handle reservation - simplified to just update local state
  const handleReserveSeats = async () => {
    if (selectedSeatIds.length === 0 || !user) {
      console.log('No seats selected or user not logged in');
      return;
    }

    console.log('User object:', user);
    console.log('Event ID:', eventId);
    console.log('Selected seats:', externalSelectedSeats);

    // The actual reservation will be handled by the parent component
    // This component just manages the UI state
    console.log('Seats ready for reservation - parent component will handle API calls');
  };

  const categories = [
    { name: "VIP", icon: Crown, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
    { name: "Fan Pit", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30" },
    { name: "General", icon: Users, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
  ];

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const reservation = reservations[seat.id];
    const isReservedByUser = reservation && reservation.expiresAt > new Date();

    if (isSelected) {
      return "bg-gradient-to-br from-green-400 to-green-500 border-green-400 text-black scale-110 shadow-lg shadow-green-500/50";
    }

    if (seat.status === "sold") {
      return "bg-red-500/80 border-red-500/60 text-white cursor-not-allowed";
    }

    if (seat.status === "reserved") {
      if (isReservedByUser) {
        return "bg-orange-500/80 border-orange-500/60 text-white animate-pulse";
      }
      return "bg-yellow-500/80 border-yellow-500/60 text-white cursor-not-allowed";
    }

    const categoryColors = {
      vip: "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30 text-purple-400",
      "fan-pit": "bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-400",
      general: "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-400",
      balcony: "bg-indigo-500/20 border-indigo-500/40 hover:bg-indigo-500/30 text-indigo-400",
    };

    return categoryColors[seat.category] || categoryColors.general;
  };

  const totalPrice = externalSelectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 shadow-2xl min-w-max">
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
          {["VIP", "Fan Pit 1", "Fan Pit 2", "Fan Pit 3", "Fan Pit 4", "General"].map(row => {
            const rowSeats = allSeats.filter(seat => seat.row === row);

            return (
              <div key={row} className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium text-gray-300 truncate">{row}</div>
                <div className="flex-1 grid grid-cols-10 gap-2">
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const canSelect = seat.status === "available" || (seat.status === "reserved" && reservations[seat.id]);

                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={`
                          w-8 h-8 rounded border-2 transition-all duration-200 text-xs font-medium flex items-center justify-center
                          ${getSeatColor(seat)}
                          ${canSelect ? "hover:scale-105 hover:shadow-lg cursor-pointer" : "cursor-not-allowed"}
                        `}
                        disabled={!canSelect}
                        data-testid={`seat-${seat.id}`}
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

        {selectedSeatIds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-800/50 border border-green-500/20 rounded-lg gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm text-gray-300">
                {selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatPrice(totalPrice)}
              </div>
            </div>
            <Button
              onClick={handleReserveSeats}
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-semibold shadow-lg"
            >
              Reserve Seats
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}