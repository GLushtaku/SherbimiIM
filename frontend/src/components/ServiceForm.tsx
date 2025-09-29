"use client";

import React, { useState, useEffect } from "react";
import { Service, Category, categoryApi } from "../../lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface ServiceFormProps {
  service?: Service;
  onSave: (serviceData: Partial<Service>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Initialize form data when service prop changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price?.toString() || "",
        durationMinutes: service.durationMinutes?.toString() || "",
        categoryId: service.categoryId || "",
      });
    }
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Emri i shërbimit është i detyrueshëm";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Përshkrimi është i detyrueshëm";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Çmimi është i detyrueshëm";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Çmimi duhet të jetë një numër pozitiv";
    }

    if (!formData.durationMinutes.trim()) {
      newErrors.durationMinutes = "Kohëzgjatja është e detyrueshme";
    } else if (
      isNaN(Number(formData.durationMinutes)) ||
      Number(formData.durationMinutes) <= 0
    ) {
      newErrors.durationMinutes = "Kohëzgjatja duhet të jetë një numër pozitiv";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Kategoria është e detyrueshme";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        durationMinutes: Number(formData.durationMinutes),
        categoryId: formData.categoryId,
      };

      await onSave(serviceData);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {service ? "Edito Shërbimin" : "Shto Shërbim të Ri"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Emri i Shërbimit *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Shkruani emrin e shërbimit"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Përshkrimi *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Përshkruani shërbimin në detaje"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Çmimi (€) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="durationMinutes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kohëzgjatja (minuta) *
            </label>
            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.durationMinutes ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="60"
            />
            {errors.durationMinutes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.durationMinutes}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kategoria *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.categoryId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Zgjidhni kategorinë</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <LoadingSpinner />}
            <span>{service ? "Përditëso" : "Krijo"} Shërbimin</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
