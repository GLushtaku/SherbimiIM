"use client";

import { useState, useEffect } from "react";
import { Service, Employee, CreateBookingData } from "../../lib/api";
import { useBookings } from "../hooks/useBookings";
import { employeeApi, bookingApi } from "../../lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createBooking } = useBookings();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBookingData>({
    serviceId: "",
    employeeId: "",
    start: "",
    end: "",
    notes: "",
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen && service) {
      setFormData({
        serviceId: service.id,
        employeeId: "",
        start: "",
        end: "",
        notes: "",
      });
      setSelectedDate("");
      setSelectedTime("");
      setError(null);
    }
  }, [isOpen, service]);

  // Load employees when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  // Check availability when service, employee, or date changes
  useEffect(() => {
    if (formData.serviceId && formData.employeeId && selectedDate) {
      checkAvailability();
    }
  }, [formData.serviceId, formData.employeeId, selectedDate]);

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAllEmployees();
      setEmployees(response);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await bookingApi.checkAvailability({
        serviceId: formData.serviceId,
        employeeId: formData.employeeId,
        date: selectedDate,
      });
      setAvailableSlots(response.availableSlots || []);
    } catch (err) {
      console.error("Failed to check availability:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.serviceId ||
      !formData.employeeId ||
      !selectedDate ||
      !selectedTime
    ) {
      setError("Ju lutemi plotësoni të gjitha fushat e detyrueshme");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + (service?.durationMinutes || 0) * 60000
      );

      const bookingData: CreateBookingData = {
        ...formData,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      };

      const newBooking = await createBooking(bookingData);

      if (onSuccess) {
        onSuccess(newBooking);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  if (!isOpen || !service) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Rezervo Shërbimin
              </h3>
              <p className="text-gray-600 mt-1">{service.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Service Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Çmimi</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(service.price)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Kohëzgjatja</h4>
                <p className="text-lg text-gray-700">
                  {formatDuration(service.durationMinutes)}
                </p>
              </div>
            </div>
            {service.description && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-900">Përshkrimi</h4>
                <p className="text-gray-600">{service.description}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punonjësi *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Zgjidhni një punonjës</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ora *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Zgjidhni orën</option>
                {availableSlots.map((slot) => {
                  const time = new Date(slot).toLocaleTimeString("sq-AL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <option key={slot} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
              {availableSlots.length === 0 &&
                formData.serviceId &&
                formData.employeeId &&
                selectedDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nuk ka orë të disponueshme për këtë datë
                  </p>
                )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shënime (Opsionale)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shtoni shënime shtesë për rezervimin..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Anulo
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.serviceId ||
                  !formData.employeeId ||
                  !selectedDate ||
                  !selectedTime
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      />
                    </svg>
                    <span>Duke krijuar...</span>
                  </>
                ) : (
                  <span>Konfirmo Rezervimin</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
