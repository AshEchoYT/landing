import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, MapPin, Calendar, Clock } from "lucide-react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

interface TicketCardProps {
  id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  seatInfo: string;
  category: string;
  price: number;
  qrData: string;
  status: "upcoming" | "completed" | "cancelled";
}

export function TicketCard({
  id,
  eventName,
  eventDate,
  eventTime,
  venue,
  seatInfo,
  category,
  price,
  qrData,
  status,
}: TicketCardProps) {
  const handleDownload = () => {
    console.log("Download ticket:", id);
    // TODO: Connect to backend /api/tickets/:id/download
  };

  const handleShare = () => {
    console.log("Share ticket:", id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover-elevate" data-testid={`ticket-${id}`}>
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 relative">
          <div className="absolute top-4 right-4">
            <Badge variant={status === "upcoming" ? "default" : status === "completed" ? "secondary" : "destructive"}>
              {status}
            </Badge>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold mb-4">{eventName}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{eventTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{venue}</span>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Seat</p>
                  <p className="font-mono font-semibold">{seatInfo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="outline">{category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-mono font-semibold">${price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download-ticket">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share-ticket">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-3 rounded-lg">
                <QRCode value={qrData} size={120} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">#{id}</p>
            </div>
          </div>
        </div>

        <div className="relative h-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background rounded-full border" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-background rounded-full border" />
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-border" />
          </div>
        </div>

        <div className="p-4 text-center text-xs text-muted-foreground">
          Present this QR code at the venue entrance
        </div>
      </Card>
    </motion.div>
  );
}
