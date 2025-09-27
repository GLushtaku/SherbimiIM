"use client";

import { useDashboardStats } from "../hooks/useStats";
import LoadingSpinner from "./LoadingSpinner";

interface DashboardStatsProps {
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ className = "" }) => {
  const { stats, loading, error, refetch } = useDashboardStats();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Statistikat e Biznesit</h3>
        <LoadingSpinner
          size="md"
          text="Duke ngarkuar statistikat..."
          className="py-8"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Statistikat e Biznesit</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Provo Përsëri
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Statistikat e Biznesit</h3>
        <button
          onClick={refetch}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Rifresko
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalBookings}
          </div>
          <div className="text-gray-600 text-sm">Rezervime Totale</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.totalServices}
          </div>
          <div className="text-gray-600 text-sm">Shërbime Aktive</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalEmployees}
          </div>
          <div className="text-gray-600 text-sm">Punonjës</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.recentBookings}
          </div>
          <div className="text-gray-600 text-sm">Këtë Javë</div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.monthlyBookings}
            </div>
            <div className="text-gray-600 text-sm">Rezervime Këtë Muaj</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.bookingsGrowth > 0 ? "+" : ""}
              {stats.bookingsGrowth}%
            </div>
            <div className="text-gray-600 text-sm">Rritje në Rezervime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
