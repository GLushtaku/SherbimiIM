"use client";

import { useAuth } from "../contexts/AuthContext";

const UserProfile: React.FC = () => {
  const { user, isLoading, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">Ju nuk jeni të kyçur</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Profili i Përdoruesit</h2>
      <div className="space-y-2">
        <p>
          <strong>Emri:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Roli:</strong> {user.role}
        </p>
        {user.phoneNumber && (
          <p>
            <strong>Telefoni:</strong> {user.phoneNumber}
          </p>
        )}
      </div>
      <button
        onClick={refreshUser}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Rifresko të dhënat
      </button>
    </div>
  );
};

export default UserProfile;
