"use client";

import { useState } from "react";
import { Author } from "../../lib/api";
import AddAuthorForm from "./AddAuthorForm";
import AuthorList from "./AuthorList";

const AuthorManagement: React.FC = () => {
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAuthorAdded = (author: Author) => {
    console.log("Autor i ri u shtua:", author);
    setShowForm(false);
  };

  const handleAuthorUpdated = (author: Author) => {
    console.log("Autori u përditësua:", author);
    setEditingAuthor(null);
    setShowForm(false);
  };

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingAuthor(null);
    setShowForm(false);
  };

  const handleAuthorDeleted = (authorId: string) => {
    console.log("Autori u fshi:", authorId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center">Menaxhimi i Autorëve</h1>

        {showForm ? (
          <AddAuthorForm
            editingAuthor={editingAuthor}
            onAuthorAdded={handleAuthorAdded}
            onAuthorUpdated={handleAuthorUpdated}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Shto Autor të Ri
            </button>
          </div>
        )}

        <AuthorList
          onEditAuthor={handleEditAuthor}
          onAuthorDeleted={handleAuthorDeleted}
        />
      </div>
    </div>
  );
};

export default AuthorManagement;
