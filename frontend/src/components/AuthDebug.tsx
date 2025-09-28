"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../hooks/useRole";

const AuthDebug: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isClient, isBusiness, isAdmin } = useRole();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug Info</h4>
      <div className="space-y-1">
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
        <div>User: {user ? user.name : "None"}</div>
        <div>Role: {user ? user.role : "None"}</div>
        <div>Is Client: {isClient() ? "Yes" : "No"}</div>
        <div>Is Business: {isBusiness() ? "Yes" : "No"}</div>
        <div>Is Admin: {isAdmin() ? "Yes" : "No"}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
