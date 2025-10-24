import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import SeatMapComponent from "@/components/SeatMapComponent";
import ThemeToggle from "@/components/ThemeToggle";
import type { Event, Seat } from "@shared/schema";

export default function SeatSelection() {
  const [, params] = useRoute("/events/:id/seats");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null);
  
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

  const createReservation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to reserve seats");
      
      const response = await apiRequest("POST", "/api/reservations", {
        eventId: params?.id,
        userId: user.id,
        seatIds: selectedSeats.map(s => s.id),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setReservationExpiry(new Date(data.expiresAt));
      queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id] });
      toast({
        title: "Seats Reserved",
        description: `You have 10 minutes to complete your purchase.`,
      });
      setLocation(`/checkout?reservationId=${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "available") return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-card rounded w-1/4" />
            <div className="h-96 bg-card rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold">Event not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/events/${params?.id}`)}
          className="mb-6 hover-elevate"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event Details
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-event-name">{event.name}</h1>
          <p className="text-muted-foreground" data-testid="text-event-date">
            {new Date(event.date).toLocaleDateString()} • {event.time}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border border-card-border rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold mb-4">Select Your Seats</h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500/20 border-2 border-green-500" />
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500/20 border-2 border-amber-500" />
                    <span className="text-sm">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-destructive/20 border-2 border-destructive" />
                    <span className="text-sm">Sold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/40 border-2 border-primary" />
                    <span className="text-sm">Selected</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <SeatMapComponent
                seats={event.seats}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-card-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Your Selection
                </h3>

                {selectedSeats.length === 0 ? (
                  <p className="text-sm text-muted-foreground" data-testid="text-no-seats">
                    No seats selected. Click on available seats to select them.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex items-center justify-between p-3 bg-background rounded-lg"
                        data-testid={`selected-seat-${seat.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            {seat.category.toUpperCase()} - Row {seat.row}, Seat {seat.number}
                          </p>
                          <p className="text-sm text-muted-foreground">${seat.price}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSeatClick(seat)}
                          data-testid={`button-remove-seat-${seat.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedSeats.length > 0 && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seats ({selectedSeats.length})</span>
                      <span data-testid="text-seats-total">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary" data-testid="text-total-price">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover-elevate text-primary-foreground"
                    size="lg"
                    onClick={() => createReservation.mutate()}
                    disabled={createReservation.isPending}
                    data-testid="button-continue-checkout"
                  >
                    {createReservation.isPending ? "Reserving..." : "Continue to Checkout"}
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Seats will be reserved for 10 minutes</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
