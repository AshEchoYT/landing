import { useState } from "react";
import { useRoute } from "wouter";
import { SeatMap } from "@/components/SeatMap";
import { PaymentModal } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// TODO: Remove mock data - fetch from backend /api/events/:id
const mockEventDetails = {
  id: "1",
  name: "Electric Nights Festival 2025",
  description:
    "Experience three days of non-stop electronic music with the world's biggest DJs. Join thousands of music lovers for an unforgettable festival experience featuring multiple stages, art installations, and incredible production.",
  image: "/images/Rock_concert_hero_image_4aa51d96.png",
  date: "June 15-17, 2025",
  time: "6:00 PM - 2:00 AM",
  location: "Los Angeles Convention Center",
  address: "1201 S Figueroa St, Los Angeles, CA 90015",
  capacity: 1000,
  availableSeats: 234,
  category: "EDM",
};

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  const eventId = params?.id || "1";

  const handleSeatSelect = (seats: any[]) => {
    setSelectedSeats(seats);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to continue",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Booking Confirmed!",
      description: "Your tickets have been sent to your email",
    });
    setShowPayment(false);
    setTimeout(() => {
      setLocation("/dashboard");
    }, 2000);
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div>
      <div
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${mockEventDetails.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-5xl font-bold mb-4">
              {mockEventDetails.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{mockEventDetails.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">{mockEventDetails.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">{mockEventDetails.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {mockEventDetails.availableSeats} seats available
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">
                {mockEventDetails.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Select Your Seats</h2>
              <SeatMap eventId={eventId} onSeatSelect={handleSeatSelect} />
              {selectedSeats.length > 0 && (
                <div className="mt-6 text-center">
                  <Button
                    size="lg"
                    onClick={handleProceedToPayment}
                    data-testid="button-proceed-checkout"
                  >
                    Proceed to Checkout (${totalAmount.toFixed(2)})
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Venue Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {mockEventDetails.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mockEventDetails.address}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={totalAmount}
        seats={selectedSeats.map((s) => s.id)}
        eventName={mockEventDetails.name}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
