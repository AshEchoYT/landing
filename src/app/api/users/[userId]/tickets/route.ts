import { NextRequest, NextResponse } from 'next/server';

// Mock ticket storage - in a real app, this would be a database
let tickets: any[] = [];
let ticketCounter = 1;

// Mock QR code generator - in a real app, you'd use a proper QR library
const generateQRCode = (ticketId: string) => {
  // This is a placeholder - in production, use a QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ticket_${ticketId}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get tickets for the user
    const userTickets = tickets.filter(ticket => ticket.userId === userId);

    return NextResponse.json(userTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { reservationId, eventId, seatIds } = body;

    if (!userId || !reservationId || !eventId || !seatIds || !Array.isArray(seatIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: reservationId, eventId, seatIds' },
        { status: 400 }
      );
    }

    // Mock event data - in a real app, fetch from database
    const mockEvent = {
      id: eventId,
      title: 'Chennai Music Festival 2025',
      date: '2025-01-15T20:00:00Z',
      venue: 'Chennai Trade Centre, Chennai',
      image: '/api/placeholder/400/200',
    };

    // Create tickets for each seat
    const createdTickets = seatIds.map((seatId: string, index: number) => {
      const ticketId = `ticket_${ticketCounter++}`;
      const ticket = {
        id: ticketId,
        userId,
        event: mockEvent,
        seat: {
          id: seatId,
          row: seatId.split('-')[0].toUpperCase(),
          number: parseInt(seatId.split('-')[1]) || index + 1,
        },
        qrCode: generateQRCode(ticketId),
        purchaseDate: new Date().toISOString(),
        status: 'active',
      };

      tickets.push(ticket);
      return ticket;
    });

    return NextResponse.json(createdTickets);
  } catch (error) {
    console.error('Error creating tickets:', error);
    return NextResponse.json(
      { error: 'Failed to create tickets' },
      { status: 500 }
    );
  }
}