"use client";

import { useEffect, useState } from "react";
import { authorApi, ApiError, Author } from "../../lib/api";

interface AddAuthorFormProps {
  onAuthorAdded?: (author: any) => void;
  onAuthorUpdated?: (author: any) => void;
  editingAuthor?: Author | null;
  onCancel?: () => void;
}

const AddAuthorForm: React.FC<AddAuthorFormProps> = ({
  onAuthorAdded,
  onAuthorUpdated,
  editingAuthor,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingAuthor) {
      setFormData({
        name: editingAuthor.name,
        surname: editingAuthor.surname,
        email: editingAuthor.email,
      });
    } else {
      setFormData({
        name: "",
        surname: "",
        email: "",
      });
    }
  }, [editingAuthor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.surname.trim() ||
      !formData.email.trim()
    ) {
      setError("Të gjitha fushat janë të detyrueshme");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (editingAuthor) {
        // Update existing author
        const updatedAuthor = await authorApi.updateAuthor(
          editingAuthor.id,
          formData
        );
        setSuccessMessage("Autori u përditësua me sukses!");
        if (onAuthorUpdated) {
          onAuthorUpdated(updatedAuthor);
        }
      } else {
        // Create new author
        const newAuthor = await authorApi.createAuthor(formData);
        setSuccessMessage("Autori u shtua me sukses!");
        setFormData({ name: "", surname: "", email: "" });
        if (onAuthorAdded) {
          onAuthorAdded(newAuthor);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Diçka shkoi gabim. Ju lutemi provoni përsëri.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({ name: "", surname: "", email: "" });
    setError(null);
    setSuccessMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center ">Shto Autor të Ri</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Emri *
          </label>

          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Shkruaj emrin..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="surname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mbiemri *
          </label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Shkruaj mbiemrin..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Shkruaj email-in..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? editingAuthor
              ? "Duke përditësuar..."
              : "Duke shtuar..."
            : editingAuthor
            ? "Përditëso"
            : "Shto Autorin"}
        </button>
      </form>
    </div>
  );
};

export default AddAuthorForm;
