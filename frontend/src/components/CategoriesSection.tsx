"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryApi, Category } from "../../lib/api";
import { useRole } from "../hooks/useRole";
import { RoleBasedContent } from "./RoleGuard";
import LoadingSpinner from "./LoadingSpinner";

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isClient, isBusiness } = useRole();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getAllCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Dështoi të ngarkohen kategoritë");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Kategoritë e Shërbimeve</h3>
        <LoadingSpinner
          size="lg"
          text="Duke ngarkuar kategoritë..."
          className="py-8"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Kategoritë e Shërbimeve</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Provo Përsëri
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Kategoritë e Shërbimeve</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Nuk ka kategoritë të disponueshme</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Kategoritë e Shërbimeve</h3>
        <button
          onClick={() => router.push("/services")}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Shiko të gjitha →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.slice(0, 6).map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className="group cursor-pointer border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{category.icon || "📁"}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h4>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{category.services || 0} shërbime</span>
                  <span>{category.businessCount || 0} biznese</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
