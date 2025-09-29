"use client";

import React, { useState } from "react";
import { useEmployeeManagement } from "../hooks/useEmployeeManagement";
import LoadingSpinner from "./LoadingSpinner";
import EmployeeForm from "./EmployeeForm";
import { Employee } from "../../lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EmployeeManagement: React.FC = () => {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignServiceToEmployee,
    removeServiceFromEmployee,
  } = useEmployeeManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(
    undefined
  );
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateEmployee = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (
      window.confirm(
        `A jeni të sigurt që doni të fshini punonjësin "${employee.name}"?`
      )
    ) {
      try {
        setFormLoading(true);
        await deleteEmployee(employee.id);
        await fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleSaveEmployee = async (
    employeeData: Partial<Employee>,
    selectedServices?: string[]
  ) => {
    try {
      setFormLoading(true);

      if (editingEmployee) {
        // Update employee
        await updateEmployee(editingEmployee.id, employeeData);

        // Handle service assignments
        if (selectedServices) {
          const currentServiceIds =
            editingEmployee.employeeServices?.map((es) => es.service.id) || [];

          // Remove services that are no longer selected
          const servicesToRemove = currentServiceIds.filter(
            (id) => !selectedServices.includes(id)
          );
          for (const serviceId of servicesToRemove) {
            try {
              await removeServiceFromEmployee(editingEmployee.id, serviceId);
            } catch (error) {
              console.error(`Error removing service ${serviceId}:`, error);
            }
          }

          // Add new services
          const servicesToAdd = selectedServices.filter(
            (id) => !currentServiceIds.includes(id)
          );
          for (const serviceId of servicesToAdd) {
            try {
              await assignServiceToEmployee(editingEmployee.id, serviceId);
            } catch (error) {
              console.error(`Error assigning service ${serviceId}:`, error);
            }
          }
        }
      } else {
        // Create new employee
        const newEmployee = await createEmployee(employeeData);

        // Assign services to new employee
        if (selectedServices && selectedServices.length > 0) {
          for (const serviceId of selectedServices) {
            try {
              await assignServiceToEmployee(newEmployee.id, serviceId);
            } catch (error) {
              console.error(`Error assigning service ${serviceId}:`, error);
            }
          }
        }
      }

      setIsFormOpen(false);
      setEditingEmployee(undefined);
      await fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(undefined);
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
          Gabim në ngarkimin e punonjësve
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchEmployees}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-900">Punonjësit e Mi</h2>
          <p className="text-gray-600 mt-1">
            Menaxho ekipin tënd dhe cakto shërbimet për çdo punonjës
          </p>
        </div>
        <button
          onClick={handleCreateEmployee}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
          <span>Shto Punonjës</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!employees || employees.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nuk keni punonjës të regjistruar
              </h3>
              <p className="text-gray-600 mb-4">
                Filloni duke shtuar punonjësin e parë në ekipin tuaj
              </p>
              <button
                onClick={handleCreateEmployee}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Shto Punonjësin e Parë
              </button>
            </div>
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {employee.position || "Pozicioni nuk është caktuar"}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.isActive !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.isActive !== false ? "Aktiv" : "Jo Aktiv"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {employee.email}
                </div>
                {employee.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {employee.phoneNumber}
                  </div>
                )}
              </div>

              {employee.employeeServices &&
                employee.employeeServices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Shërbimet:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {employee.employeeServices.map(
                        (
                          employeeService: {
                            service: { id: string; name: string };
                          },
                          index: number
                        ) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                          >
                            {employeeService.service.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Edito
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Detajet
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
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
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Employee Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEmployee ? "Edito Punonjësin" : "Shto Punonjës të Ri"}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <EmployeeForm
                employee={editingEmployee}
                onSave={handleSaveEmployee}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
