"use client";

import { usePlatformStats } from "../hooks/useStats";
import LoadingSpinner from "./LoadingSpinner";

const StatisticsSection: React.FC = () => {
  const { stats, loading, error, refetch } = usePlatformStats();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Platforma Jonë në Numra</h2>
          <p className="text-blue-100 text-lg">
            Bashkohu me mijëra përdorues që po përdorin Sherbimi IM
          </p>
        </div>
        <LoadingSpinner
          size="lg"
          text="Duke ngarkuar statistikat..."
          className="py-8"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Platforma Jonë në Numra
          </h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-2 rounded-lg font-medium"
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return `${num}+`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Platforma Jonë në Numra</h2>
        <p className="text-white text-lg !important">
          Bashkohu me mijëra përdorues që po përdorin Sherbimi IM
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {formatNumber(stats.businesses)}
          </div>
          <div className="text-blue-100">Biznese Aktive</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {formatNumber(stats.clients)}
          </div>
          <div className="text-blue-100">Klientë të Kënaqur</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {formatNumber(stats.categories)}
          </div>
          <div className="text-blue-100">Kategori Shërbimesh</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {formatNumber(stats.totalBookings)}
          </div>
          <div className="text-blue-100">Rezervime të Suksesshme</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
