"use client";

import { Service } from "../../lib/api";

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBookClick?: (service: Service) => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookClick,
}) => {
  if (!isOpen || !service) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {service.name}
              </h3>
              <p className="text-gray-600 mt-1">Detajet e shërbimit</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Service Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
            <div className="text-white text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4"
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
              <p className="text-lg font-medium">Shërbim</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Informacione Bazë
              </h4>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Çmimi
                    </label>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {formatPrice(service.price)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kohëzgjatja
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>
                </div>
              </div>

              {service.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Përshkrimi
                  </label>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID e Shërbimit
                  </label>
                  <p className="text-gray-600 font-mono">{service.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Krijuar më
                  </label>
                  <p className="text-gray-600">
                    {new Date(service.createdAt).toLocaleDateString("sq-AL")}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Informacione Biznesi
              </h4>

              {service.business && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Emri i Biznesit
                      </label>
                      <p className="text-gray-900 font-medium">
                        {service.business.name}
                      </p>
                    </div>

                    {service.business.city && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Qyteti
                        </label>
                        <p className="text-gray-600">{service.business.city}</p>
                      </div>
                    )}

                    {service.business.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Adresa
                        </label>
                        <p className="text-gray-600">
                          {service.business.address}
                        </p>
                      </div>
                    )}

                    {service.business.phoneNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Telefoni
                        </label>
                        <p className="text-gray-600">
                          {service.business.phoneNumber}
                        </p>
                      </div>
                    )}

                    {service.business.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <a
                          href={service.business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {service.business.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category Information */}
              {service.category && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Kategoria
                  </h5>
                  <div className="flex items-center space-x-2">
                    {service.category.icon && (
                      <span className="text-2xl">{service.category.icon}</span>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.category.name}
                      </p>
                      {service.category.description && (
                        <p className="text-sm text-gray-600">
                          {service.category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Available Employees */}
              {service.employeeServices &&
                service.employeeServices.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Punonjës të Disponueshëm
                    </h5>
                    <div className="space-y-2">
                      {service.employeeServices.map((employeeService) => (
                        <div
                          key={employeeService.employee.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {employeeService.employee.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {employeeService.employee.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {employeeService.employee.position}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Mbyll
            </button>
            {onBookClick && (
              <button
                onClick={() => {
                  onBookClick(service);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Rezervo Tani
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
