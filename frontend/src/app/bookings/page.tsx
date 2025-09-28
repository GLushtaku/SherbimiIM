"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../hooks/useRole";
import BookingsList from "../../components/BookingsList";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BookingsPage() {
  const { user, isLoading } = useAuth();
  const { isClient } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && !isClient) {
      router.push("/");
    }
  }, [user, isLoading, isClient, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Rezervimet e Mia
                </h1>
                <p className="text-gray-600">
                  Menaxhoni rezervimet tuaja dhe shikoni statusin e tyre
                </p>
              </div>
              <button
                onClick={() => router.push("/services")}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Rezervim i Ri</span>
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white rounded-lg shadow-md">
            <BookingsList />
          </div>
        </div>
      </div>
    </div>
  );
}
