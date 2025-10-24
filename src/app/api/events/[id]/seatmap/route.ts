import { NextRequest, NextResponse } from 'next/server';

// Mock seat data - in a real app, this would come from a database
const generateMockSeats = (eventId: string) => {
  const rows = ["VIP", "Fan Pit 1", "Fan Pit 2", "Fan Pit 3", "Fan Pit 4", "General"];

  return rows.flatMap((row, rowIndex) => {
    const isVip = row === "VIP";
    const isFanPit = row.startsWith("Fan Pit");
    const category = isVip ? "vip" : isFanPit ? "fan-pit" : "general";
    const price = isVip ? 20800 : isFanPit ? 15000 : 10000;

    return Array.from({ length: 10 }, (_, i) => ({
      id: `${row.toLowerCase().replace(' ', '-')}-${i}`,
      row,
      number: i + 1,
      category: category as "vip" | "fan-pit" | "general" | "balcony",
      status: Math.random() < 0.1 ? "sold" : Math.random() < 0.2 ? "reserved" : "available",
      price,
    }));
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // In a real app, you would fetch this from a database
    const seatMap = {
      eventId,
      seats: generateMockSeats(eventId),
      venue: "Main Auditorium",
      capacity: 500,
      availableSeats: 234,
    };

    return NextResponse.json(seatMap);
  } catch (error) {
    console.error('Error fetching seat map:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seat map' },
      { status: 500 }
    );
  }
}