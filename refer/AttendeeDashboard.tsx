import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { BookingTimeline } from "@/components/BookingTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// TODO: Remove mock data - fetch from backend /api/users/:id/tickets
const mockTickets = [
  {
    id: "TKT-2025-001",
    eventName: "Electric Nights Festival 2025",
    eventDate: "June 15, 2025",
    eventTime: "7:00 PM - 11:00 PM",
    venue: "Los Angeles Convention Center",
    seatInfo: "A12",
    category: "VIP",
    price: 199,
    qrData: "TKT-2025-001-A12-VIP",
    status: "upcoming" as const,
  },
  {
    id: "TKT-2025-002",
    eventName: "Jazz Under the Stars",
    eventDate: "July 22, 2025",
    eventTime: "8:00 PM - 11:00 PM",
    venue: "Central Park, New York",
    seatInfo: "C5",
    category: "Premium",
    price: 129,
    qrData: "TKT-2025-002-C5-PREMIUM",
    status: "upcoming" as const,
  },
];

const mockBookings = [
  {
    id: "1",
    eventName: "Electric Nights Festival 2025",
    eventDate: "June 15, 2025 - 7:00 PM",
    venue: "Los Angeles Convention Center",
    seats: ["A12"],
    amount: 199,
    status: "upcoming" as const,
    bookedAt: "May 20, 2025",
  },
  {
    id: "2",
    eventName: "Jazz Under the Stars",
    eventDate: "July 22, 2025 - 8:00 PM",
    venue: "Central Park, New York",
    seats: ["C5"],
    amount: 129,
    status: "upcoming" as const,
    bookedAt: "May 18, 2025",
  },
];

export default function AttendeeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Manage your tickets and view your booking history
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="tickets" data-testid="tab-tickets">
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            Booking History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="grid grid-cols-1 gap-6">
            {mockTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TicketCard {...ticket} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <BookingTimeline bookings={mockBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
