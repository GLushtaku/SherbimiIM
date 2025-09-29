import { useState, useEffect, useCallback } from "react";
import { employeeApi, Employee, ApiError } from "../../lib/api";

interface UseEmployeeManagementReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  createEmployee: (employeeData: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (
    id: string,
    employeeData: Partial<Employee>
  ) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  assignServiceToEmployee: (
    employeeId: string,
    serviceId: string
  ) => Promise<void>;
  removeServiceFromEmployee: (
    employeeId: string,
    serviceId: string
  ) => Promise<void>;
}

export const useEmployeeManagement = (): UseEmployeeManagementReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në marrjen e punonjësve");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(
    async (employeeData: Partial<Employee>) => {
      try {
        setError(null);
        const newEmployee = await employeeApi.createEmployee({
          name: employeeData.name || "",
          email: employeeData.email || "",
          phoneNumber: employeeData.phoneNumber,
          position: employeeData.position,
          isActive: employeeData.isActive ?? true,
        });
        setEmployees((prev) => [...prev, newEmployee]);
        return newEmployee;
      } catch (err) {
        console.error("Error creating employee:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gabim në krijimin e punonjësit");
        }
        throw err;
      }
    },
    []
  );

  const updateEmployee = useCallback(
    async (id: string, employeeData: Partial<Employee>) => {
      try {
        setError(null);
        const updatedEmployee = await employeeApi.updateEmployee(id, {
          name: employeeData.name,
          email: employeeData.email,
          phoneNumber: employeeData.phoneNumber,
          position: employeeData.position,
          isActive: employeeData.isActive,
        });
        setEmployees((prev) =>
          prev.map((employee) =>
            employee.id === id ? updatedEmployee : employee
          )
        );
        return updatedEmployee;
      } catch (err) {
        console.error("Error updating employee:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gabim në përditësimin e punonjësit");
        }
        throw err;
      }
    },
    []
  );

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setError(null);
      await employeeApi.deleteEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në fshirjen e punonjësit");
      }
      throw err;
    }
  }, []);

  const assignServiceToEmployee = useCallback(
    async (employeeId: string, serviceId: string) => {
      try {
        setError(null);
        await employeeApi.assignServiceToEmployee(employeeId, serviceId);
        // Refresh employees to get updated service assignments
        await fetchEmployees();
      } catch (err) {
        console.error("Error assigning service to employee:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gabim në caktimin e shërbimit");
        }
        throw err;
      }
    },
    [fetchEmployees]
  );

  const removeServiceFromEmployee = useCallback(
    async (employeeId: string, serviceId: string) => {
      try {
        setError(null);
        await employeeApi.removeServiceFromEmployee(employeeId, serviceId);
        // Refresh employees to get updated service assignments
        await fetchEmployees();
      } catch (err) {
        console.error("Error removing service from employee:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gabim në heqjen e shërbimit");
        }
        throw err;
      }
    },
    [fetchEmployees]
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignServiceToEmployee,
    removeServiceFromEmployee,
  };
};
