"use client";

import React, { useState, useEffect } from "react";
import { Employee, Service, serviceApi } from "../../lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (
    employeeData: Partial<Employee>,
    selectedServices?: string[]
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    position: "",
    isActive: true,
  });

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await serviceApi.getBusinessServices();
        setServices(response.services || []);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  // Initialize form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || employee.phone || "",
        position: employee.position || "",
        isActive: employee.isActive ?? true,
      });

      // Set selected services
      const serviceIds =
        employee.employeeServices?.map((es) => es.service.id) || [];
      setSelectedServices(serviceIds);
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Emri i punonjësit është i detyrueshëm";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email është i detyrueshëm";
    } else if (!/^[^\s@]+@[^\s@]+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email nuk është i vlefshëm";
    }

    if (
      formData.phoneNumber &&
      !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Numri i telefonit nuk është i vlefshëm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const employeeData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        position: formData.position.trim() || undefined,
        isActive: formData.isActive,
      };

      await onSave(employeeData, selectedServices);
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {employee ? "Edito Punonjësin" : "Shto Punonjës të Ri"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Emri i Plotë *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Shkruani emrin e plotë"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Numri i Telefonit
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="+383 XX XXX XXX"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pozicioni
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Pozicioni në kompani"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700"
          >
            Punonjës aktiv
          </label>
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Shërbimet që mund të ofrojë punonjësi
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all ${
                      selectedServices.includes(service.id)
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{service.name}</div>
                      <div className="text-xs opacity-75">
                        {service.price}€ - {service.durationMinutes} min
                      </div>
                    </div>
                    {selectedServices.includes(service.id) && (
                      <svg
                        className="w-4 h-4 text-green-600"
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
                    )}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-600">
                Zgjidhni shërbimet që ky punonjës mund të ofrojë klientëve
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <LoadingSpinner />}
            <span>{employee ? "Përditëso" : "Krijo"} Punonjësin</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
