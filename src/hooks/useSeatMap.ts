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
        const data = await seatMapApi.getSeatmap(eventId);
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
    if (selectedSeats.find(s => s.seatNo === seat.seatNo)) {
      removeSeat(seat.seatNo);
      // Cancel reservation if needed
    } else {
      addSeat(seat);
      try {
        const reservation = await seatMapApi.reserveSeat({
          eventId,
          seatNo: seat.seatNo,
          attendeeId: 'user_id', // This should come from auth context
          duration: 15
        });
        if (reservation.success && reservation.data) {
          setReservation(reservation.data.reservationId, reservation.data.expiresAt);
        }
      } catch (err) {
        // Handle error
      }
    }
  };

  return { seatMap, loading, error, selectSeat };
};