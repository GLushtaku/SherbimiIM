import { useState, useCallback } from "react";
import { serviceApi, Service, ApiError } from "../../lib/api";

interface UseServiceManagementReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  createService: (serviceData: Partial<Service>) => Promise<void>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useServiceManagement = (): UseServiceManagementReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getBusinessServices();
      setServices(response.services || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në marrjen e shërbimeve");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      setError(null);
      const newService = await serviceApi.createService(serviceData);
      setServices((prev) => [...prev, newService]);
    } catch (err) {
      console.error("Error creating service:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në krijimin e shërbimit");
      }
      throw err;
    }
  }, []);

  const updateService = useCallback(
    async (id: string, serviceData: Partial<Service>) => {
      try {
        setError(null);
        const updatedService = await serviceApi.updateService(id, serviceData);
        setServices((prev) =>
          prev.map((service) => (service.id === id ? updatedService : service))
        );
      } catch (err) {
        console.error("Error updating service:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gabim në përditësimin e shërbimit");
        }
        throw err;
      }
    },
    []
  );

  const deleteService = useCallback(async (id: string) => {
    try {
      setError(null);
      await serviceApi.deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në fshirjen e shërbimit");
      }
      throw err;
    }
  }, []);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
};
