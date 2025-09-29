"use client";

import React from "react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import DashboardStatsCard from "../../components/DashboardStatsCard";
import RecentActivity from "../../components/RecentActivity";
import QuickActions from "../../components/QuickActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import DashboardLayout from "../../components/DashboardLayout";

export default function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats();

  // Mock recent activities data (you can replace this with real data from API)
  const recentActivities = [
    {
      id: "1",
      type: "booking" as const,
      title: "Rezervim i ri për 'Konsultim Financiar'",
      description: "Klienti: John Doe - 15:30, 25 Dhjetor 2024",
      time: "2 orë më parë",
      status: "pending" as const,
    },
    {
      id: "2",
      type: "service" as const,
      title: "Shërbim i ri i shtuar: 'Konsultim Juridik'",
      description: "Çmimi: 80€, Kohëzgjatja: 60 minuta",
      time: "1 ditë më parë",
    },
    {
      id: "3",
      type: "employee" as const,
      title: "Punonjës i ri i regjistruar: Maria Garcia",
      description: "Pozicioni: Konsulent Financiar",
      time: "3 ditë më parë",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gabim në ngarkimin e dashboard-it
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Provo Përsëri
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStatsCard
          title="Total Rezervime"
          value={stats?.totalBookings || 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          change={stats?.bookingsGrowth}
          changeLabel="këtë muaj"
          color="blue"
        />
        <DashboardStatsCard
          title="Shërbimet Aktive"
          value={stats?.totalServices || 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          change={stats?.servicesGrowth}
          changeLabel="këtë muaj"
          color="green"
        />
        <DashboardStatsCard
          title="Punonjës"
          value={stats?.totalEmployees || 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          color="purple"
        />
        <DashboardStatsCard
          title="Rezervime Këtë Muaj"
          value={stats?.monthlyBookings || 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>

        {/* Quick Actions */}
        {/* <div className="lg:col-span-1">
          <QuickActions />
        </div> */}
      </div>

      {/* Additional Stats Row */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rezervimet e Fundit (7 ditët e fundit)
          </h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats?.recentBookings || 0}
          </div>
          <p className="text-sm text-gray-600">Rezervime të reja këtë javë</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performanca e Biznesit
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Rezervime të konfirmuara
              </span>
              <span className="text-sm font-medium text-green-600">
                {Math.round((stats?.totalBookings || 0) * 0.85)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rezervime në pritje</span>
              <span className="text-sm font-medium text-yellow-600">
                {Math.round((stats?.totalBookings || 0) * 0.15)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Mesatarja e klientëve/ditë
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(((stats?.monthlyBookings || 0) / 30) * 10) / 10}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
