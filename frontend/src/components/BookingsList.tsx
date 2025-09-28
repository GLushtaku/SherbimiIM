"use client";

import { useState, useEffect } from "react";
import { useBookings } from "../hooks/useBookings";
import { Booking } from "../../lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface BookingsListProps {
  showFilters?: boolean;
  limit?: number;
  className?: string;
}

const BookingsList: React.FC<BookingsListProps> = ({
  showFilters = true,
  limit,
  className = "",
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { bookings, loading, error, refetch } = useBookings({
    date: selectedDate || undefined,
    limit,
  });

  // Update current time every minute to refresh statuses
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate status based on current date/time vs booking date/time
  const calculateBookingStatus = (booking: Booking) => {
    // If booking is already cancelled, keep it cancelled
    if (booking.status === "CANCELLED") {
      return "CANCELLED";
    }

    const now = currentTime;
    const bookingStart = new Date(booking.start);
    const bookingEnd = new Date(booking.end);

    // If booking is in the past (after end time)
    if (now > bookingEnd) {
      return "COMPLETED";
    }

    // If booking is currently happening (between start and end time)
    if (now >= bookingStart && now <= bookingEnd) {
      return "CONFIRMED";
    }

    // If booking is in the future (before start time)
    if (now < bookingStart) {
      return "PENDING";
    }

    // Fallback
    return "PENDING";
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    const calculatedStatus = calculateBookingStatus(booking);
    return calculatedStatus === statusFilter;
  });

  const getStatusColor = (booking: Booking) => {
    const status = calculateBookingStatus(booking);
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (booking: Booking) => {
    const status = calculateBookingStatus(booking);
    switch (status) {
      case "PENDING":
        return "Në Pritje";
      case "CONFIRMED":
        return "Konfirmuar";
      case "CANCELLED":
        return "Anuluar";
      case "COMPLETED":
        return "Përfunduar";
      default:
        return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("sq-AL"),
      time: date.toLocaleTimeString("sq-AL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Rezervimet e Mia</h3>
        <LoadingSpinner
          size="lg"
          text="Duke ngarkuar rezervimet..."
          className="py-8"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Rezervimet e Mia</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Provo Përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">
          Rezervimet e Mia
        </h3>
        <p className="text-gray-600 mt-1">
          {filteredBookings.length} rezervim
          {filteredBookings.length !== 1 ? "e" : ""} gjithsej
        </p>
      </div>

      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtro sipas datës
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtro sipas statusit
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Të gjitha</option>
                <option value="PENDING">Në Pritje</option>
                <option value="CONFIRMED">Konfirmuar</option>
                <option value="CANCELLED">Anuluar</option>
                <option value="COMPLETED">Përfunduar</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nuk ka rezervime
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedDate || statusFilter !== "all"
                ? "Nuk u gjetën rezervime me këto filtra."
                : "Bëni rezervimin tuaj të parë."}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const { date, time } = formatDateTime(booking.start);
            return (
              <div
                key={booking.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {booking.service?.name || "Shërbim i panjohur"}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          booking
                        )}`}
                      >
                        {getStatusText(booking)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p>
                          <span className="font-medium">Data:</span> {date}
                        </p>
                        <p>
                          <span className="font-medium">Ora:</span> {time}
                        </p>
                        <p>
                          <span className="font-medium">Çmimi:</span>{" "}
                          {booking.service?.price}€
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Punonjësi:</span>{" "}
                          {booking.employee?.name}
                        </p>
                        <p>
                          <span className="font-medium">Pozicioni:</span>{" "}
                          {booking.employee?.position}
                        </p>
                        <p>
                          <span className="font-medium">Kohëzgjatja:</span>{" "}
                          {booking.service?.durationMinutes} min
                        </p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Shënime:</span>{" "}
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium"
                    >
                      Shiko Detajet
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Detajet e Rezervimit</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shërbimi
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.service?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statusi
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedBooking
                      )}`}
                    >
                      {getStatusText(selectedBooking)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedBooking.start).date}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ora
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedBooking.start).time}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Punonjësi
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.employee?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pozicioni
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.employee?.position}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Çmimi
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.service?.price}€
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kohëzgjatja
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.service?.durationMinutes} minuta
                    </p>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shënime
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Krijuar më
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedBooking.createdAt).toLocaleDateString(
                        "sq-AL"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Përditësuar më
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedBooking.updatedAt).toLocaleDateString(
                        "sq-AL"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Mbyll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
