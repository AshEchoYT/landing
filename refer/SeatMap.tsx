import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  onSeatSelect: (seats: Seat[]) => void;
}

export function SeatMap({ eventId, onSeatSelect }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

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

  // Update parent component when selected seats change
  useEffect(() => {
    const selectedSeatObjects = seats.filter(seat => selectedSeats.includes(seat.id));
    onSeatSelect(selectedSeatObjects);
  }, [selectedSeats, onSeatSelect]);

  const toggleSeat = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === "sold") return;

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const categories = [
    { name: "VIP", icon: Crown, color: "text-primary", bg: "bg-primary/20", border: "border-primary/30" },
    { name: "Fan Pit", icon: Zap, color: "text-cyan", bg: "bg-cyan/20", border: "border-cyan/30" },
    { name: "General", icon: Users, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
    { name: "Balcony", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
  ];

  const getSeatColor = (seat: Seat, isSelected: boolean) => {
    if (isSelected) return "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/50";
    if (seat.status === "sold") return "bg-destructive/30 border-destructive/50 text-destructive cursor-not-allowed";
    if (seat.status === "reserved") return "bg-amber-500/30 border-amber-500/50 text-amber-400 animate-pulse";
    
    const categoryColors = {
      vip: "bg-primary/20 border-primary/40 hover:bg-primary/30 text-primary",
      "fan-pit": "bg-cyan/20 border-cyan/40 hover:bg-cyan/30 text-cyan",
      general: "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-400",
      balcony: "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30 text-purple-400",
    };
    
    return categoryColors[seat.category];
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-heading font-bold mb-4">Select Your Seats</h3>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <Badge key={cat.name} className={`${cat.bg} ${cat.border} ${cat.color}`}>
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted/30 rounded-lg text-center">
        <div className="text-sm text-muted-foreground mb-2">STAGE</div>
        <div className="h-2 bg-gradient-to-r from-primary via-cyan to-primary rounded-full" />
      </div>

      <div className="space-y-4 mb-6">
        {rows.map(row => {
          const rowSeats = seats.filter(seat => seat.row === row);
          
          return (
            <div key={row} className="flex items-center gap-2">
              <div className="w-16 text-sm font-medium text-muted-foreground truncate">{row}</div>
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
                        ${seat.status !== "sold" ? "hover:scale-105" : ""}
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
        <div className="flex items-center justify-between p-4 bg-card border border-card-border rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
            </div>
            <div className="text-2xl font-bold text-primary" data-testid="text-total-price">
              ${totalPrice}
            </div>
          </div>
          <Button className="bg-primary hover-elevate" data-testid="button-proceed-checkout">
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Card>
  );
}
