"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../../lib/api";
import { useRole } from "../../hooks/useRole";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { isClient, isBusiness, getRoleDisplayName, getRoleColor } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    businessProfile: {
      companyName: "",
      businessLicense: "",
      taxId: "",
      yearsInBusiness: 0,
      emergencyContact: "",
      alternatePhone: "",
      acceptsWalkIns: false,
      appointmentRequired: true,
      maxBookingsPerDay: 10,
    },
    clientProfile: {
      dateOfBirth: "",
      gender: "",
      emergencyContact: "",
      preferredContact: "email",
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
      } as { email: boolean; sms: boolean; push: boolean },
    },
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        businessProfile: {
          companyName: user.businessProfile?.companyName || "",
          businessLicense: user.businessProfile?.businessLicense || "",
          taxId: user.businessProfile?.taxId || "",
          yearsInBusiness: user.businessProfile?.yearsInBusiness || 0,
          emergencyContact: user.businessProfile?.emergencyContact || "",
          alternatePhone: user.businessProfile?.alternatePhone || "",
          acceptsWalkIns: user.businessProfile?.acceptsWalkIns || false,
          appointmentRequired:
            user.businessProfile?.appointmentRequired ?? true,
          maxBookingsPerDay: user.businessProfile?.maxBookingsPerDay || 10,
        },
        clientProfile: {
          dateOfBirth: user.clientProfile?.dateOfBirth
            ? user.clientProfile.dateOfBirth.split("T")[0]
            : "",
          gender: user.clientProfile?.gender || "",
          emergencyContact: user.clientProfile?.emergencyContact || "",
          preferredContact: user.clientProfile?.preferredContact || "email",
          notificationPreferences:
            (user.clientProfile?.notificationPreferences as {
              email: boolean;
              sms: boolean;
              push: boolean;
            }) ||
            ({
              email: true,
              sms: false,
              push: true,
            } as { email: boolean; sms: boolean; push: boolean }),
        },
      });
    }
  }, [user]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
    section?: string
  ) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as Record<string, unknown>),
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      setErrorMessage("");
      setSuccessMessage("");

      await authApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        profileData: {
          businessProfile: isBusiness() ? formData.businessProfile : undefined,
          clientProfile: isClient() ? formData.clientProfile : undefined,
        },
      });

      // Refresh user data to get the updated information
      await refreshUser();

      setSuccessMessage("Profili u përditësua me sukses! ");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gabim në përditësimin e profilit"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Fjalëkalimet nuk përputhen");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("Fjalëkalimi duhet të ketë të paktën 6 karaktere");
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage("");
      setSuccessMessage("");

      await authApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Refresh user data after password change
      await refreshUser();

      setSuccessMessage("Fjalëkalimi u ndryshua me sukses! ");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gabim në ndryshimin e fjalëkalimit"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            Duhet të jeni të kyçur për të parë profilin tuaj.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mx-auto p-6">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profili im</h1>
            <p className="text-gray-600 mt-1">
              Menaxhoni informacionet e profilit tuaj
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-md hover:shadow-lg"
              >
                Përditëso Profilin
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                    // Reset form data
                    if (user) {
                      setFormData({
                        name: user.name || "",
                        phoneNumber: user.phoneNumber || "",
                        businessProfile: {
                          companyName: user.businessProfile?.companyName || "",
                          businessLicense:
                            user.businessProfile?.businessLicense || "",
                          taxId: user.businessProfile?.taxId || "",
                          yearsInBusiness:
                            user.businessProfile?.yearsInBusiness || 0,
                          emergencyContact:
                            user.businessProfile?.emergencyContact || "",
                          alternatePhone:
                            user.businessProfile?.alternatePhone || "",
                          acceptsWalkIns:
                            user.businessProfile?.acceptsWalkIns || false,
                          appointmentRequired:
                            user.businessProfile?.appointmentRequired ?? true,
                          maxBookingsPerDay:
                            user.businessProfile?.maxBookingsPerDay || 10,
                        },
                        clientProfile: {
                          dateOfBirth: user.clientProfile?.dateOfBirth
                            ? user.clientProfile.dateOfBirth.split("T")[0]
                            : "",
                          gender: user.clientProfile?.gender || "",
                          emergencyContact:
                            user.clientProfile?.emergencyContact || "",
                          preferredContact:
                            user.clientProfile?.preferredContact || "email",
                          notificationPreferences:
                            (user.clientProfile?.notificationPreferences as {
                              email: boolean;
                              sms: boolean;
                              push: boolean;
                            }) ||
                            ({
                              email: true,
                              sms: false,
                              push: true,
                            } as {
                              email: boolean;
                              sms: boolean;
                              push: boolean;
                            }),
                        },
                      });
                    }
                  }}
                  className="px-4 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                >
                  Anulo
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors shadow-md hover:shadow-lg"
                >
                  {isUpdating ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 shadow-md">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 shadow-md">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informacione Bazë
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Emri i plotë
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {user.name || "Nuk është vendosur"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">
                Email-i nuk mund të ndryshohet
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Numri i telefonit
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {user.phoneNumber || "Nuk është vendosur"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isBusiness() ? "Informacione Biznesi" : "Informacione Klienti"}
          </h2>

          {isBusiness() ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emri i kompanisë
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.businessProfile.companyName}
                    onChange={(e) =>
                      handleInputChange(
                        "companyName",
                        e.target.value,
                        "businessProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.businessProfile?.companyName || "Nuk është vendosur"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Licenca e biznesit
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.businessProfile.businessLicense}
                    onChange={(e) =>
                      handleInputChange(
                        "businessLicense",
                        e.target.value,
                        "businessProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.businessProfile?.businessLicense ||
                      "Nuk është vendosur"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vjet në biznes
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.businessProfile.yearsInBusiness}
                    onChange={(e) =>
                      handleInputChange(
                        "yearsInBusiness",
                        parseInt(e.target.value) || 0,
                        "businessProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.businessProfile?.yearsInBusiness || 0} vjet
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kontakt emergjence
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.businessProfile.emergencyContact}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value,
                        "businessProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.businessProfile?.emergencyContact ||
                      "Nuk është vendosur"}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.businessProfile.acceptsWalkIns}
                    onChange={(e) =>
                      handleInputChange(
                        "acceptsWalkIns",
                        e.target.checked,
                        "businessProfile"
                      )
                    }
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Pranon vizitorë pa rezervim
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data e lindjes
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.clientProfile.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange(
                        "dateOfBirth",
                        e.target.value,
                        "clientProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.clientProfile?.dateOfBirth
                      ? new Date(
                          user.clientProfile.dateOfBirth
                        ).toLocaleDateString("sq-AL")
                      : "Nuk është vendosur"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gjinia
                </label>
                {isEditing ? (
                  <select
                    value={formData.clientProfile.gender}
                    onChange={(e) =>
                      handleInputChange(
                        "gender",
                        e.target.value,
                        "clientProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Zgjidhni gjininë</option>
                    <option value="male">Mashkull</option>
                    <option value="female">Femër</option>
                    <option value="other">Tjetër</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.clientProfile?.gender || "Nuk është vendosur"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kontakt emergjence
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.clientProfile.emergencyContact}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value,
                        "clientProfile"
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {user.clientProfile?.emergencyContact ||
                      "Nuk është vendosur"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ndrysho Fjalëkalimin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fjalëkalimi aktual
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fjalëkalimi i ri
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Konfirmo fjalëkalimin
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleChangePassword}
            disabled={
              isUpdating ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword
            }
            className="bg-green-600 cursor-pointer hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            {isUpdating ? "Duke ndryshuar..." : "Ndrysho Fjalëkalimin"}
          </button>
        </div>
      </div>
    </div>
  );
}
