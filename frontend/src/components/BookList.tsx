"use client";

import { useState, useEffect } from "react";
import { bookApi, ApiError, Book } from "../../lib/api";

interface AuthorListProps {
  onEditBook?: (book: Book) => void;
  onAddBook?: (book: Book) => void;
  onBookDeleted?: (bookId: string) => void;
}

const AuthorList: React.FC<AuthorListProps> = ({
  onEditBook,
  onBookDeleted,
  onAddBook,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookApi.getAllBooks();
      setBooks(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në ngarkimin e librave");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("A jeni të sigurt që dëshironi të fshini këtë libër?")) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await bookApi.deleteBook(id);
      setBooks(books.filter((book) => book.id !== id));
      if (onBookDeleted) {
        onBookDeleted(id);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në fshirjen e Lubrit");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [onAddBook, onEditBook, onBookDeleted]);

  if (loading && books.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Duke ngarkuar librat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Lista e Autorëve</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nuk ka libra të regjistruar.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {books.map((book) => (
              <li key={book.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {book.name}
                    </h3>
                    {book.author && (
                      <>
                        <p className="text-sm text-gray-500">
                          {book.author.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Autori: {book.author.name} {book.author.surname}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditBook?.(book)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Përditëso
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Fshi
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuthorList;
