"use client";

import { useEffect, useState } from "react";
import { authorApi, ApiError, Author, Book, bookApi } from "../../lib/api";

interface AddBookFormProps {
  onBookAdded?: (book: any) => void;
  onBookUpdated?: (book: any) => void;
  editingBook?: Book | null;
  onCancel?: () => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({
  onBookAdded,
  onBookUpdated,
  editingBook,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    authorId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  useEffect(() => {
    if (editingBook) {
      setFormData({
        name: editingBook.name,
        authorId: editingBook.authorId,
      });
    } else {
      setFormData({
        name: "",
        authorId: "",
      });
    }
  }, [editingBook]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setAuthorsLoading(true);
        setError(null);
        const data = await authorApi.getAllAuthors();
        setAuthors(data);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gabim në ngarkimin e autorëve"
        );
      } finally {
        setAuthorsLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.authorId.trim()) {
      setError("Të gjitha fushat janë të detyrueshme");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (editingBook) {
        // Update existing author
        const updatedBook = await bookApi.updateBook(editingBook.id, formData);
        setSuccessMessage("Libëri u përditësua me sukses!");
        if (onBookUpdated) {
          onBookUpdated(updatedBook);
        }
      } else {
        // Create new author
        const newBook = await bookApi.createBook(formData);
        setSuccessMessage("Autori u shtua me sukses!");
        setFormData({ name: "", authorId: "" });
        if (onBookAdded) {
          onBookAdded(newBook);
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
    setFormData({ name: "", authorId: "" });
    setError(null);
    setSuccessMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center ">Shto Libër të Ri</h2>
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
            htmlFor="authorId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Autori *
          </label>
          {authorsLoading ? (
            <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">
                Duke ngarkuar autorët...
              </span>
            </div>
          ) : (
            <select
              id="authorId"
              name="authorId"
              value={formData.authorId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Zgjidhni një autor</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} {author.surname}
                </option>
              ))}
            </select>
          )}
          {authors.length === 0 && !authorsLoading && (
            <p className="text-sm text-gray-500 mt-1">
              Nuk ka autorë të disponueshëm. Ju lutemi shtoni një autor
              fillimisht.
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading || authorsLoading || authors.length === 0}
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? editingBook
                ? "Duke përditësuar..."
                : "Duke shtuar..."
              : editingBook
              ? "Përditëso"
              : "Shto Libërin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
