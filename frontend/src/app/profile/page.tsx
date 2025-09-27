import React from "react";

export default function ProfilePage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Profili</h1>
      <p className="text-gray-600">
        Këtu mund të menaxhoni informacionet e profilit tuaj.
      </p>
      <div className="mt-6">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          Përditëso Profilin
        </button>
      </div>
    </div>
  );
}
