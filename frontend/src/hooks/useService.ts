import { useState, useEffect } from "react";
import { serviceApi, Service } from "../../lib/api";

export const useService = (id: string) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchService = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getServiceById(id);
      setService(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  return {
    service,
    loading,
    error,
    refetch: fetchService,
  };
};
