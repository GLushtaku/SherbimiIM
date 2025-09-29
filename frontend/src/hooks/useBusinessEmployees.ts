import { useState, useEffect } from "react";
import { employeeApi, Employee } from "../../lib/api";

interface UseBusinessEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBusinessEmployees = (): UseBusinessEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (err) {
      console.error("Error fetching business employees:", err);
      setError(
        err instanceof Error ? err.message : "Gabim në marrjen e punonjësve"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
  };
};
