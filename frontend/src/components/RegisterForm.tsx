"use client";

import { useState } from "react";
import { authApi, ApiError } from "../../lib/api";

interface RegisterFormProps {
  onRegisterSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "CLIENT" as "CLIENT" | "BUSINESS",
    // Business fields
    businessData: {
      companyName: "",
      businessLicense: "",
      taxId: "",
      yearsInBusiness: "",
      emergencyContact: "",
      alternatePhone: "",
      acceptsWalkIns: false,
      appointmentRequired: true,
      maxBookingsPerDay: "",
      description: "",
      phoneNumber: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      category: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Emri, email dhe fjalëkalimi janë të detyrueshme");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Fjalëkalimet nuk përputhen");
      return;
    }

    if (formData.password.length < 6) {
      setError("Fjalëkalimi duhet të ketë të paktën 6 karaktere");
      return;
    }

    if (formData.role === "BUSINESS") {
      if (!formData.businessData.companyName.trim()) {
        setError("Emri i kompanisë është i detyrueshëm për biznes");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        businessData:
          formData.role === "BUSINESS" ? formData.businessData : undefined,
      };

      const response = await authApi.register(userData);

      setError(null);
      if (onRegisterSuccess) {
        onRegisterSuccess(response);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në regjistrim. Ju lutemi provoni përsëri.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("businessData.")) {
      const businessField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        businessData: {
          ...prev.businessData,
          [businessField]:
            type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Regjistrohu</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Type Selection */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lloji i Përdoruesit *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="CLIENT">Klient</option>
            <option value="BUSINESS">Biznes</option>
          </select>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Emri *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Shkruaj emrin..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Shkruaj email-in..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fjalëkalimi *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Shkruaj fjalëkalimin..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Konfirmo Fjalëkalimin *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Konfirmo fjalëkalimin..."
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Numri i Telefonit
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Shkruaj numrin e telefonit..."
          />
        </div>

        {/* Business Fields - Only show if role is BUSINESS */}
        {formData.role === "BUSINESS" && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Të dhëna të Biznesit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="businessData.companyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Emri i Kompanisë *
                </label>
                <input
                  type="text"
                  id="businessData.companyName"
                  name="businessData.companyName"
                  value={formData.businessData.companyName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shkruaj emrin e kompanisë..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="businessData.businessLicense"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Licenca e Biznesit
                </label>
                <input
                  type="text"
                  id="businessData.businessLicense"
                  name="businessData.businessLicense"
                  value={formData.businessData.businessLicense}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shkruaj licencën..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  htmlFor="businessData.address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresa
                </label>
                <input
                  type="text"
                  id="businessData.address"
                  name="businessData.address"
                  value={formData.businessData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shkruaj adresën..."
                />
              </div>

              <div>
                <label
                  htmlFor="businessData.city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Qyteti
                </label>
                <input
                  type="text"
                  id="businessData.city"
                  name="businessData.city"
                  value={formData.businessData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shkruaj qytetin..."
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Duke regjistruar..." : "Regjistrohu"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Tashmë keni llogari?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Hyr këtu
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
