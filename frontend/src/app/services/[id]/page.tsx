"use client";

import { useParams, useRouter } from "next/navigation";
import { useService } from "../../../hooks/useService";
import { useBookings } from "../../../hooks/useBookings";
import { useAuth } from "../../../contexts/AuthContext";
import { useRole } from "../../../hooks/useRole";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useState, useEffect } from "react";
import { bookingApi } from "../../../../lib/api";
import { CreateBookingData } from "../../../../lib/api";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isClient } = useRole();
  const { service, loading, error, refetch } = useService(params.id as string);
  const { createBooking, refetch: refetchBookings } = useBookings({
    enabled: !!user,
  });

  const [employees, setEmployees] = useState<
    { id: string; name: string; position?: string; email?: string }[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateBookingData>({
    serviceId: "",
    employeeId: "",
    start: "",
    end: "",
    notes: "",
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Load employees when service loads
  useEffect(() => {
    if (service) {
      // Extract employees from service data
      const serviceEmployees =
        service.employeeServices?.map((es) => es.employee) || [];

      setEmployees(serviceEmployees);

      setFormData((prev) => ({
        ...prev,
        serviceId: service.id,
      }));
    }
  }, [service]);

  // Check availability when service, employee, or date changes
  useEffect(() => {
    console.log("useEffect triggered:", {
      serviceId: formData.serviceId,
      employeeId: formData.employeeId,
      selectedDate,
      employees: employees.length,
    });

    if (formData.serviceId && formData.employeeId && selectedDate) {
      console.log("All conditions met, calling checkAvailability");
      checkAvailability();
    } else {
      console.log("Conditions not met, clearing slots");
      setAvailableSlots([]);
      setReservedSlots([]);
    }
  }, [formData.serviceId, formData.employeeId, selectedDate]);

  const checkAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      console.log("Checking availability for:", {
        serviceId: formData.serviceId,
        employeeId: formData.employeeId,
        date: selectedDate,
      });

      const response = await bookingApi.checkAvailability({
        serviceId: formData.serviceId,
        employeeId: formData.employeeId,
        date: selectedDate,
      });

      console.log("Availability response:", response);
      console.log(
        "Available slots count:",
        (response.availableSlots || []).length
      );
      console.log(
        "Reserved slots count:",
        (response.reservedSlots || []).length
      );
      console.log("Available slots:", response.availableSlots);
      console.log("Reserved slots:", response.reservedSlots);

      // Set available and reserved slots from response (real data only)
      setAvailableSlots(response.availableSlots || []);
      setReservedSlots(response.reservedSlots || []);
    } catch (err) {
      console.error("Failed to check availability:", err);
      setAvailableSlots([]);
      setReservedSlots([]);
    } finally {
      setAvailabilityLoading(false);
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
      setBookingError("Ju lutemi plotësoni të gjitha fushat e detyrueshme");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setBookingSuccess(false);

      // Convert selectedTime to proper format for Date constructor
      const [hours, minutes] = selectedTime.split(":");

      if (!hours || !minutes) {
        throw new Error("Invalid time format");
      }

      const startDateTime = new Date(selectedDate);
      if (isNaN(startDateTime.getTime())) {
        throw new Error("Invalid date format");
      }

      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (isNaN(startDateTime.getTime())) {
        throw new Error("Invalid date/time combination");
      }

      const endDateTime = new Date(
        startDateTime.getTime() + (service?.durationMinutes || 0) * 60000
      );

      console.log("Date conversion:", {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        durationMinutes: service?.durationMinutes,
      });

      const bookingData: CreateBookingData = {
        ...formData,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      };

      await createBooking(bookingData);

      // Show success message
      setBookingSuccess(true);

      // Refresh bookings and redirect to bookings page after delay
      refetchBookings();
      setTimeout(() => {
        router.push("/bookings");
      }, 2000); // 2 second delay to show success message
    } catch (err) {
      console.error("Booking creation error:", err);
      let errorMessage = "Failed to create booking";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }

      setBookingError(errorMessage);
    } finally {
      setBookingLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <LoadingSpinner
                size="lg"
                text="Duke ngarkuar shërbimin..."
                className="py-8"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Shërbimi nuk u gjet
                </h1>
                <p className="text-gray-600 mb-4">
                  {error || "Shërbimi që kërkoni nuk ekziston ose është hequr."}
                </p>
                <button
                  onClick={() => router.push("/services")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Kthehu te Shërbimet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Service Image */}
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg
                      className="w-20 h-20 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-lg font-medium">Shërbim</p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {service.name}
                  </h1>

                  {service.description && (
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Service Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Çmimi
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(service.price)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Kohëzgjatja
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDuration(service.durationMinutes)}
                      </p>
                    </div>
                  </div>

                  {/* Business Information */}
                  {service.business && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Informacione Biznesi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700">
                            Emri i Biznesit
                          </h4>
                          <p className="text-gray-900">
                            {service.business.name}
                          </p>
                        </div>
                        {service.business.city && (
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Qyteti
                            </h4>
                            <p className="text-gray-900">
                              {service.business.city}
                            </p>
                          </div>
                        )}
                        {service.business.address && (
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Adresa
                            </h4>
                            <p className="text-gray-900">
                              {service.business.address}
                            </p>
                          </div>
                        )}
                        {service.business.phoneNumber && (
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Telefoni
                            </h4>
                            <p className="text-gray-900">
                              {service.business.phoneNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Information */}
                  {service.category && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Kategoria
                      </h3>
                      <div className="flex items-center space-x-3">
                        {service.category.icon && (
                          <span className="text-3xl">
                            {service.category.icon}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {service.category.name}
                          </p>
                          {service.category.description && (
                            <p className="text-gray-600">
                              {service.category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Rezervo Shërbimin
                </h2>

                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Duhet të hyni në llogari për të bërë rezervim
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Hyr në Llogari
                    </button>
                  </div>
                ) : !isClient() ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Vetëm klientët mund të bëjnë rezervime
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Kthehu në Ballinë
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{bookingError}</p>
                      </div>
                    )}

                    {bookingSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p className="text-green-600 text-sm font-medium">
                            Rezervimi u krijua me sukses! Po ju ridrejtojmë te
                            faqja e rezervimeve...
                          </p>
                        </div>
                      </div>
                    )}

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
                            {employee.name}{" "}
                            {employee.position ? `- ${employee.position}` : ""}
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
                        onChange={(e) => {
                          console.log("Date changed:", e.target.value);
                          setSelectedDate(e.target.value);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ora *
                        {formData.serviceId &&
                          formData.employeeId &&
                          selectedDate && (
                            <span className="ml-2 text-xs text-green-600">
                              ✓ Gati për të parë orët
                            </span>
                          )}
                      </label>

                      {/* Loading state */}
                      {availabilityLoading && (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 text-blue-500 mr-2"
                            viewBox="0 0 24 24"
                          >
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
                          <span className="text-sm text-gray-600">
                            Duke kontrolluar disponueshmërinë...
                          </span>
                        </div>
                      )}

                      {/* Time slots grid */}
                      {(availableSlots.length > 0 ||
                        reservedSlots.length > 0) && (
                        <div className="space-y-3">
                          {/* Available slots */}
                          {availableSlots.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Ora të disponueshme:
                              </h4>
                              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                {availableSlots.map((slot) => {
                                  const time = new Date(
                                    slot
                                  ).toLocaleTimeString("sq-AL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                  const isSelected = selectedTime === time;

                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => setSelectedTime(time)}
                                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                        isSelected
                                          ? "bg-blue-500 text-white border-blue-500"
                                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Reserved slots */}
                          {reservedSlots.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Ora të rezervuara:
                              </h4>
                              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
                                {reservedSlots.map((slot) => {
                                  const time = new Date(
                                    slot
                                  ).toLocaleTimeString("sq-AL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });

                                  return (
                                    <div
                                      key={slot}
                                      className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed flex items-center justify-center"
                                    >
                                      <span className="flex items-center">
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                          />
                                        </svg>
                                        {time}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No availability message */}
                      {!availabilityLoading &&
                        availableSlots.length === 0 &&
                        formData.serviceId &&
                        formData.employeeId &&
                        selectedDate && (
                          <div className="w-full px-3 py-2 border border-orange-200 rounded-md bg-orange-50">
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 text-orange-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <span className="text-sm text-orange-700 font-medium">
                                  Nuk ka orë të disponueshme për këtë datë
                                </span>
                                <p className="text-xs text-orange-600 mt-1">
                                  Provo një datë tjetër ose zgjidh një punonjës
                                  tjetër
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Instructions */}
                      {!formData.serviceId ||
                      !formData.employeeId ||
                      !selectedDate ? (
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <p>
                            Zgjidhni punonjësin dhe datën për të parë orët e
                            disponueshme:
                          </p>
                          <ul className="list-disc list-inside ml-2 space-y-0.5">
                            {!formData.serviceId && (
                              <li>Shërbimi nuk është zgjedhur</li>
                            )}
                            {!formData.employeeId && (
                              <li>Punonjësi nuk është zgjedhur</li>
                            )}
                            {!selectedDate && <li>Data nuk është zgjedhur</li>}
                          </ul>
                        </div>
                      ) : null}
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        bookingLoading ||
                        !formData.serviceId ||
                        !formData.employeeId ||
                        !selectedDate ||
                        !selectedTime
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      {bookingLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
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
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
