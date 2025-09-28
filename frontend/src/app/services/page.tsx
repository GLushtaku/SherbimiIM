"use client";

import { useState } from "react";
import { useServices } from "../../hooks/useServices";
import ServiceCard from "../../components/ServiceCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ServicesPage() {
  const { services, loading, error, refetch } = useServices();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  // Filter services based on search and filters
  const filteredServices = (services || []).filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPrice = (() => {
      switch (priceFilter) {
        case "under-50":
          return service.price < 50;
        case "50-100":
          return service.price >= 50 && service.price <= 100;
        case "100-200":
          return service.price >= 100 && service.price <= 200;
        case "over-200":
          return service.price > 200;
        default:
          return true;
      }
    })();

    const matchesDuration = (() => {
      switch (durationFilter) {
        case "under-30":
          return service.durationMinutes < 30;
        case "30-60":
          return service.durationMinutes >= 30 && service.durationMinutes <= 60;
        case "60-120":
          return (
            service.durationMinutes >= 60 && service.durationMinutes <= 120
          );
        case "over-120":
          return service.durationMinutes > 120;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesPrice && matchesDuration;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Shërbimet
              </h1>
              <LoadingSpinner
                size="lg"
                text="Duke ngarkuar shërbimet..."
                className="py-8"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Shërbimet
              </h1>
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Provo Përsëri
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shërbimet e Disponueshme
            </h1>
            <p className="text-gray-600">
              Zgjidhni shërbimin që ju intereson dhe rezervoni një takim
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kërko shërbime
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Shkruani emrin e shërbimit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtro sipas çmimit
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Të gjitha çmimet</option>
                  <option value="under-50">Nën 50€</option>
                  <option value="50-100">50€ - 100€</option>
                  <option value="100-200">100€ - 200€</option>
                  <option value="over-200">Mbi 200€</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtro sipas kohës
                </label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Të gjitha kohët</option>
                  <option value="under-30">Nën 30 min</option>
                  <option value="30-60">30 - 60 min</option>
                  <option value="60-120">1 - 2 orë</option>
                  <option value="over-120">Mbi 2 orë</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nuk u gjetën shërbime
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || priceFilter !== "all" || durationFilter !== "all"
                  ? "Provo të ndryshosh filtrat për të gjetur shërbime të tjera."
                  : "Nuk ka shërbime të disponueshme momentalisht."}
              </p>
              {(searchTerm ||
                priceFilter !== "all" ||
                durationFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPriceFilter("all");
                    setDurationFilter("all");
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Fshij Filtrat
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
