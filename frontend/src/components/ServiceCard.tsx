"use client";

import { useRouter } from "next/navigation";
import { Service } from "../../lib/api";

interface ServiceCardProps {
  service: Service;
  onDetailsClick?: (service: Service) => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onDetailsClick,
  className = "",
}) => {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleCardClick = () => {
    router.push(`/services/${service.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
    >
      {/* Service Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <svg
            className="w-16 h-16 mx-auto mb-2"
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
          <p className="text-sm font-medium">Shërbim</p>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {service.name}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(service.price)}
            </div>
          </div>
        </div>

        {service.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {service.description}
          </p>
        )}

        {/* Service Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDuration(service.durationMinutes)}</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span>{formatPrice(service.price)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/services/${service.id}`);
            }}
            className="px-6 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
          >
            Detajet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
