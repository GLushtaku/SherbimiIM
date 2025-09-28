import { useState, useEffect } from "react";
import {
  bookingApi,
  Booking,
  CreateBookingData,
  UpdateBookingData,
  AvailabilityCheck,
} from "../../lib/api";

export const useBookings = (params?: {
  date?: string;
  limit?: number;
  enabled?: boolean;
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    // Don't fetch if disabled
    if (params?.enabled === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("useBookings: Fetching bookings with params:", params);
      const response = await bookingApi.getAllBookings(params);
      console.log("useBookings: Received bookings:", response);
      setBookings(response);
    } catch (err) {
      console.error("useBookings: Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [params?.date, params?.limit, params?.enabled]);

  const createBooking = async (data: CreateBookingData) => {
    try {
      console.log("useBookings: Creating booking with data:", data);
      const newBooking = await bookingApi.createBooking(data);
      console.log("useBookings: Booking created successfully:", newBooking);
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      console.error("useBookings: Error creating booking:", err);
      throw err;
    }
  };

  const updateBooking = async (id: string, data: UpdateBookingData) => {
    try {
      const updatedBooking = await bookingApi.updateBooking(id, data);
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? updatedBooking : booking))
      );
      return updatedBooking;
    } catch (err) {
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await bookingApi.deleteBooking(id);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const cancelBooking = async (id: string) => {
    return updateBooking(id, { status: "CANCELLED" });
  };

  const confirmBooking = async (id: string) => {
    return updateBooking(id, { status: "CONFIRMED" });
  };

  const completeBooking = async (id: string) => {
    return updateBooking(id, { status: "COMPLETED" });
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
  };
};

export const useBooking = (id: string) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getBookingById(id);
      setBooking(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  return {
    booking,
    loading,
    error,
    refetch: fetchBooking,
  };
};

export const useAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async (data: AvailabilityCheck) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.checkAvailability(data);
      setAvailableSlots(response.availableSlots);
      return response.availableSlots;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check availability"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    availableSlots,
    loading,
    error,
    checkAvailability,
  };
};
