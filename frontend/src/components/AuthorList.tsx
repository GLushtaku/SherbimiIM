"use client";

import { useState, useEffect } from "react";
import { authorApi, ApiError, Author } from "../../lib/api";

interface AuthorListProps {
  onEditAuthor?: (author: Author) => void;
  onAuthorDeleted?: (authorId: string) => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

const AuthorList: React.FC<AuthorListProps> = ({
  onEditAuthor,
  onAuthorDeleted,
  refreshTrigger = 0,
}) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authorApi.getAllAuthors();
      setAuthors(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në ngarkimin e autorëve");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("A jeni të sigurt që dëshironi të fshini këtë autor?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authorApi.deleteAuthor(id);
      setAuthors(authors.filter((author) => author.id !== id));
      if (onAuthorDeleted) {
        onAuthorDeleted(id);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gabim në fshirjen e autorit");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load authors on component mount and when refreshTrigger changes
  useEffect(() => {
    loadAuthors();
  }, [refreshTrigger]);

  if (loading && authors.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Duke ngarkuar autorët...</div>
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

      {authors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nuk ka autorë të regjistruar.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {authors.map((author) => (
              <li key={author.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {author.name} {author.surname}
                    </h3>
                    <p className="text-sm text-gray-500">{author.email}</p>
                    {author.books && author.books.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Libra: {author.books.length}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditAuthor?.(author)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Përditëso
                    </button>
                    <button
                      onClick={() => handleDelete(author.id)}
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
