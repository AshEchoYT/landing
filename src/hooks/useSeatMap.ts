import { useState, useEffect } from 'react';
import { seatMapApi } from '../api/seatMapApi';
import { useSeatStore } from '../store/useSeatStore';

export const useSeatMap = (eventId: string) => {
  const [seatMap, setSeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedSeats, addSeat, removeSeat, setReservation, clearReservation } = useSeatStore();

  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        const data = await seatMapApi.getSeatMap(eventId);
        setSeatMap(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [eventId]);

  const selectSeat = async (seat: any) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      removeSeat(seat.id);
      // Cancel reservation if needed
    } else {
      addSeat(seat);
      try {
        const reservation = await seatMapApi.createReservation({
          eventId,
          seatIds: [seat.id],
        });
        setReservation(reservation.id, new Date(reservation.expiresAt));
      } catch (err) {
        // Handle error
      }
    }
  };

  return { seatMap, loading, error, selectSeat };
};