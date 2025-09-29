import { useState, useEffect } from "react";
import { serviceApi, Service } from "../../lib/api";

interface UseBusinessServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBusinessServices = (): UseBusinessServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getAllServices();
      setServices(response.services || []);
    } catch (err) {
      console.error("Error fetching business services:", err);
      setError(
        err instanceof Error ? err.message : "Gabim në marrjen e shërbimeve"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
};
