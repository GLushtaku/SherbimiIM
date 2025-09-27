"use client";

import { useRouter } from "next/navigation";
import { useRole } from "../hooks/useRole";

import WelcomeMessage from "../components/WelcomeMessage";
import CategoriesSection from "../components/CategoriesSection";
import StatisticsSection from "../components/StatisticsSection";

export default function MainPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    canApplyToServices,
    canManageServices,
    canViewDashboard,
    getRoleDisplayName,
    getRoleColor,
  } = useRole();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <WelcomeMessage />

          {/* Categories Section */}
          <div className="mb-12">
            <CategoriesSection />
          </div>

          {/* Statistics Section */}
          <StatisticsSection />
        </div>
      </div>
    </div>
  );
}
