"use client";

import React, { useState, useEffect } from "react";
import { Service } from "../../lib/api";
import ServiceForm from "./ServiceForm";
import LoadingSpinner from "./LoadingSpinner";
import { useServiceManagement } from "../hooks/useServiceManagement";

const ServiceManagement: React.FC = () => {
  const {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch,
  } = useServiceManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [deletingService, setDeletingService] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load services on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateService = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (
      window.confirm(
        `A jeni të sigurt që doni të fshini shërbimin "${service.name}"?`
      )
    ) {
      try {
        setDeletingService(service.id);
        await deleteService(service.id);
      } catch (error) {
        console.error("Error deleting service:", error);
      } finally {
        setDeletingService(null);
      }
    }
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    try {
      setFormLoading(true);

      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await createService(serviceData);
      }

      setIsFormOpen(false);
      setEditingService(undefined);
    } catch (error) {
      console.error("Error saving service:", error);
      // Error is handled by the hook and displayed in the UI
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingService(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
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
          Gabim në ngarkimin e shërbimeve
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Provo Përsëri
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Menaxho Shërbimet
          </h2>
          <p className="text-gray-600 mt-1">
            Shto, edito ose fshi shërbimet e biznesit tënd
          </p>
        </div>
        <button
          onClick={handleCreateService}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Shto Shërbim</span>
        </button>
      </div>

      {/* Service Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ServiceForm
              service={editingService}
              onSave={handleSaveService}
              onCancel={handleCancelForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!services || services.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nuk keni shërbime të regjistruara
              </h3>
              <p className="text-gray-600 mb-4">
                Filloni duke shtuar shërbimin e parë për biznesin tuaj
              </p>
              <button
                onClick={handleCreateService}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Shto Shërbimin e Parë
              </button>
            </div>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktiv
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Çmimi:</span>
                  <span className="font-medium">{service.price}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kohëzgjatja:</span>
                  <span className="font-medium">
                    {service.durationMinutes} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kategoria:</span>
                  <span className="font-medium">
                    {service.category?.name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Edito
                </button>
                <button
                  onClick={() => handleDeleteService(service)}
                  disabled={deletingService === service.id}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingService === service.id ? (
                    <LoadingSpinner />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
