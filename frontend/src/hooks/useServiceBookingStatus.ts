import { useState, useEffect } from "react";
import { useBookings } from "./useBookings";
import { Service, Booking } from "../../lib/api";

export const useServiceBookingStatus = (service: Service | null) => {
  const { bookings } = useBookings();
  const [isBooked, setIsBooked] = useState(false);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!service || !bookings.length) {
      setIsBooked(false);
      setExistingBooking(null);
      return;
    }

    // Check if there's an existing booking for this service
    const booking = bookings.find(
      (booking) =>
        booking.serviceId === service.id &&
        (booking.status === "PENDING" || booking.status === "CONFIRMED")
    );

    if (booking) {
      setIsBooked(true);
      setExistingBooking(booking);
    } else {
      setIsBooked(false);
      setExistingBooking(null);
    }
  }, [service, bookings]);

  return {
    isBooked,
    existingBooking,
  };
};
