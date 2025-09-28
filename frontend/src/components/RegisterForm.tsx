"use client";

import { useState } from "react";
import { authApi, ApiError } from "../../lib/api";
import toast from "react-hot-toast";

interface RegisterFormProps {
  onRegisterSuccess?: (user: unknown) => void;
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Emri është i detyrueshëm";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email është i detyrueshëm";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email nuk është i vlefshëm";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Fjalëkalimi është i detyrueshëm";
    } else if (formData.password.length < 6) {
      newErrors.password = "Fjalëkalimi duhet të ketë të paktën 6 karaktere";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Konfirmimi i fjalëkalimit është i detyrueshëm";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Fjalëkalimet nuk përputhen";
    }

    if (formData.role === "BUSINESS") {
      if (!formData.businessData.companyName.trim()) {
        newErrors["businessData.companyName"] =
          "Emri i kompanisë është i detyrueshëm";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

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

      setSuccess(true);
      setErrors({});
      toast.success("Regjistrimi u krye me sukses!.");

      // Clear form data
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "CLIENT" as "CLIENT" | "BUSINESS",
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
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else {
        setErrors({
          general: "Gabim në regjistrim. Ju lutemi provoni përsëri.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

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
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Regjistrohu! 🎉
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Krijoni llogari si {formData.role === "CLIENT" ? "Klient" : "Biznes"}
        </p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selector */}
          <div className="flex mb-6 bg-gray-100 rounded-full p-1 overflow-hidden">
            {["CLIENT", "BUSINESS"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: type as "CLIENT" | "BUSINESS",
                  }));
                }}
                disabled={loading}
                className={`flex-1 py-2 rounded-full transition-all ${
                  formData.role === type
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {type === "CLIENT" ? "Klient" : "Biznes"}
              </button>
            ))}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Emri *"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 focus:ring-4 transition-all placeholder-gray-400 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 focus:ring-4 transition-all placeholder-gray-400 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="password"
                name="password"
                placeholder="Fjalëkalimi *"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 focus:ring-4 transition-all placeholder-gray-400 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Konfirmo Fjalëkalimin *"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 focus:ring-4 transition-all placeholder-gray-400 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Numri i Telefonit"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400"
            />
          </div>

          {/* Business Fields - Only show if role is BUSINESS */}
          {formData.role === "BUSINESS" && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Të dhëna të Biznesit
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="businessData.companyName"
                    placeholder="Emri i Kompanisë *"
                    value={formData.businessData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-gray-900 focus:ring-4 transition-all placeholder-gray-400 ${
                      errors["businessData.companyName"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    required
                  />
                  {errors["businessData.companyName"] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["businessData.companyName"]}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="businessData.businessLicense"
                    placeholder="Licenca e Biznesit"
                    value={formData.businessData.businessLicense}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <input
                    type="text"
                    name="businessData.address"
                    placeholder="Adresa"
                    value={formData.businessData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="businessData.city"
                    placeholder="Qyteti"
                    value={formData.businessData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
          >
            {loading
              ? "Duke regjistruar..."
              : success
              ? "Regjistruar!"
              : "Regjistrohu"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Tashmë keni llogari?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              disabled={loading}
            >
              Hyr këtu
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
