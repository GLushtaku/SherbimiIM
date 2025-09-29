"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../../lib/api";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  onLoginSuccess?: (user: unknown) => void;
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Mirë se vini! 🎉
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Hyni si {formData.userType === "CLIENT" ? "Klient" : "Biznes"}
        </p>
        {/* User Type Selector */}
        <div className="flex mb-6 bg-gray-100 rounded-full p-1 overflow-hidden">
          {["CLIENT", "BUSINESS"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  userType: type as "CLIENT" | "BUSINESS",
                }));
                handleBlur("userType");
                if (errors.userType || errors.general) {
                  setErrors((prev) => ({
                    ...prev,
                    userType: undefined,
                    general: undefined,
                  }));
                }
              }}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-full transition-all ${
                formData.userType === type
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {type === "CLIENT" ? "Klient" : "Biznes"}
            </button>
          ))}
        </div>
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
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={`w-full px-4 py-3 rounded-xl border text-gray-900 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400`}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Fjalëkalimi"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              className={`w-full px-4 py-3 rounded-xl border text-gray-900 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder-gray-400`}
              disabled={isLoading}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
          >
            {isLoading ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>
        <div className="mt-4 space-y-3">
          <button
            onClick={() => signIn("google")}
            className="w-full cursor-pointer py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Vazhdo me Google</span>
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Nuk keni llogari?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              disabled={isLoading}
            >
              Regjistrohu këtu
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
