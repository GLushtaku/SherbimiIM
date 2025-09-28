"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError, User } from "../../../lib/api";
import LoginForm from "../../components/LoginForm";
import RegisterForm from "../../components/RegisterForm";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getCurrentUser();
        const userData = response.user;

        if (userData) {
          // Redirect based on user role
          if (userData.role === "CLIENT") {
            router.push("/");
          } else if (userData.role === "BUSINESS") {
            router.push("/dashboard");
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        // Silently handle authentication errors - user is not logged in
        // This is normal behavior, no need to log or redirect
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    router.push("/");
  };

  const handleRegisterSuccess = () => {
    setIsLogin(true);
  };

  //   if (loading) {
  //     return (
  //       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="text-gray-500">Duke ngarkuar...</div>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {isLogin ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
