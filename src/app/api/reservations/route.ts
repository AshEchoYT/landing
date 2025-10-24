import { NextRequest, NextResponse } from 'next/server';

// Mock reservation storage - in a real app, this would be a database
let reservations: any[] = [];
let reservationCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, seatIds, userId } = body;

    if (!eventId || !seatIds || !Array.isArray(seatIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, seatIds' },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = {
      id: `res_${reservationCounter++}`,
      eventId,
      userId: userId || 'user_123', // Mock user ID
      seatIds,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    reservations.push(reservation);

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('id');

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Missing reservation ID' },
        { status: 400 }
      );
    }

    // Find and remove reservation
    const index = reservations.findIndex(res => res.id === reservationId);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    reservations.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}