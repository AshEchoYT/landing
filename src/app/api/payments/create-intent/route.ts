import { NextRequest, NextResponse } from 'next/server';

// Mock payment storage - in a real app, this would be a database
let payments: any[] = [];
let paymentCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId, amount } = body;

    if (!reservationId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: reservationId, amount' },
        { status: 400 }
      );
    }

    // Create payment intent (simulated)
    const paymentIntent = {
      id: `pi_${paymentCounter++}`,
      clientSecret: `pi_${paymentCounter}_secret_${Math.random().toString(36).substring(2)}`,
      amount: amount,
      currency: 'inr',
      status: 'requires_payment_method',
      reservationId,
    };

    payments.push(paymentIntent);

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// Endpoint to confirm payment (simulate successful payment)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, reservationId } = body;

    if (!paymentIntentId || !reservationId) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, reservationId' },
        { status: 400 }
      );
    }

    // Find the payment intent
    const payment = payments.find(p => p.id === paymentIntentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Mark as completed
    payment.status = 'succeeded';

    return NextResponse.json({
      success: true,
      paymentIntentId,
      status: 'succeeded',
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}