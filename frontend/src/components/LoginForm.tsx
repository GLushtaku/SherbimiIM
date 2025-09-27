"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../../lib/api";

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
  onSwitchToRegister?: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  userType?: string;
  general?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "CLIENT" as "CLIENT" | "BUSINESS",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    userType: false,
  });
  const router = useRouter();
  const { login, isLoading } = useAuth();

  useEffect(() => {
    const newErrors: FormErrors = {};
    if (touched.email) {
      if (!formData.email.trim()) newErrors.email = "Email është i detyrueshëm";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Email nuk është i vlefshëm";
    }
    if (touched.password) {
      if (!formData.password.trim())
        newErrors.password = "Fjalëkalimi është i detyrueshëm";
    }
    setErrors(newErrors);
  }, [formData, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, userType: true });

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrors({ general: "Të gjitha fushat janë të detyrueshme" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ general: "Email nuk është i vlefshëm" });
      return;
    }
    if (formData.password.length < 6) {
      setErrors({ general: "Fjalëkalimi duhet të ketë të paktën 6 karaktere" });
      return;
    }

    try {
      setErrors({});
      await login(formData.email, formData.password, formData.userType);

      if (onLoginSuccess)
        onLoginSuccess({
          user: { email: formData.email, userType: formData.userType },
        });
      router.push(formData.userType === "BUSINESS" ? "/dashboard" : "/");
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessages: { [key: number]: string } = {
          401: "Email ose fjalëkalimi janë gabim. Ju lutemi kontrolloni të dhënat tuaja.",
          400: "Të dhënat e dërguara nuk janë të vlefshme. Ju lutemi kontrolloni fushat.",
          500: "Gabim në server. Ju lutemi provoni përsëri më vonë.",
        };
        setErrors({
          general:
            errorMessages[err.status] ||
            err.message ||
            "Gabim i panjohur. Ju lutemi provoni përsëri.",
        });
      } else {
        setErrors({
          general:
            "Gabim në lidhje. Ju lutemi kontrolloni internetin tuaj dhe provoni përsëri.",
        });
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    !Object.keys(errors).some((key) => errors[key as keyof FormErrors]) &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.userType;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Hyr në Llogari</h2>
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
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
              <p className="text-sm font-medium">{errors.general}</p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="userType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lloji i Përdoruesit *
          </label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            onBlur={() => handleBlur("userType")}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.userType
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            disabled={isLoading}
            required
          >
            <option value="CLIENT">Klient</option>
            <option value="BUSINESS">Biznes</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-600">{errors.userType}</p>
          )}
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
            onBlur={() => handleBlur("email")}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Shkruaj email-in..."
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
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
            onBlur={() => handleBlur("password")}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Shkruaj fjalëkalimin..."
            disabled={isLoading}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
              Duke hyrë...
            </span>
          ) : (
            "Hyr"
          )}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Nuk keni llogari?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={isLoading}
          >
            Regjistrohu këtu
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
