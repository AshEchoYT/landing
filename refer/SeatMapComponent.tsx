import type { Seat } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Crown, Zap, Ticket, ArrowUpCircle } from "lucide-react";

interface SeatMapComponentProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

export default function SeatMapComponent({ seats, selectedSeats, onSeatClick }: SeatMapComponentProps) {
  const rows = Array.from(new Set(seats.map(s => s.row))).sort();
  const maxSeatsPerRow = Math.max(...rows.map(row => seats.filter(s => s.row === row).length));

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      return "bg-primary/40 border-primary hover:bg-primary/50";
    }
    switch (seat.status) {
      case "available":
        return "bg-green-500/20 border-green-500 hover:bg-green-500/30 cursor-pointer";
      case "reserved":
        return "bg-amber-500/20 border-amber-500 cursor-not-allowed";
      case "sold":
        return "bg-destructive/20 border-destructive cursor-not-allowed";
      default:
        return "bg-muted border-border";
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { className: "w-3 h-3", strokeWidth: 2.5 };
    switch (category) {
      case "vip":
        return <Crown {...iconProps} />;
      case "fan-pit":
        return <Zap {...iconProps} />;
      case "general":
        return <Ticket {...iconProps} />;
      case "balcony":
        return <ArrowUpCircle {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-b from-primary/20 to-transparent border border-primary/30 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold text-primary">STAGE</p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const rowSeats = seats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
          
          return (
            <div key={row} className="flex items-center gap-2">
              <div className="w-12 text-sm font-medium text-muted-foreground text-center">
                Row {row}
              </div>
              
              <div className="flex-1 flex justify-center gap-1 flex-wrap">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => onSeatClick(seat)}
                    disabled={seat.status !== "available" && !selectedSeats.some(s => s.id === seat.id)}
                    className={cn(
                      "w-10 h-10 rounded border-2 transition-all duration-200 flex items-center justify-center text-xs font-semibold",
                      getSeatColor(seat),
                      selectedSeats.some(s => s.id === seat.id) && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                    )}
                    title={`${seat.category.toUpperCase()} - Row ${seat.row}, Seat ${seat.number} - $${seat.price}`}
                    data-testid={`seat-${seat.id}`}
                  >
                    {getCategoryIcon(seat.category)}
                  </button>
                ))}
              </div>

              <div className="w-12" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        {["vip", "fan-pit", "general", "balcony"].map((category) => {
          const categorySeats = seats.filter(s => s.category === category);
          const availableCount = categorySeats.filter(s => s.status === "available").length;
          const minPrice = Math.min(...categorySeats.map(s => s.price));
          
          const getLegendIcon = (cat: string) => {
            const iconProps = { className: "w-6 h-6", strokeWidth: 2 };
            switch (cat) {
              case "vip": return <Crown {...iconProps} />;
              case "fan-pit": return <Zap {...iconProps} />;
              case "general": return <Ticket {...iconProps} />;
              case "balcony": return <ArrowUpCircle {...iconProps} />;
              default: return null;
            }
          };
          
          return (
            <div key={category} className="text-center p-3 bg-card rounded-lg">
              <div className="flex justify-center mb-1">{getLegendIcon(category)}</div>
              <p className="text-sm font-medium capitalize">{category.replace('-', ' ')}</p>
              <p className="text-xs text-muted-foreground">{availableCount} available</p>
              <p className="text-sm font-semibold text-primary">From ${minPrice}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
