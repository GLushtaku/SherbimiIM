"use client";

import { useState } from "react";
import { Book } from "../../lib/api";

import BookList from "./BookList";
import AddBookForm from "./AddBookForm";

const BookManagment: React.FC = () => {
  const [editingBooks, setEditingBooks] = useState<Book | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleBookAdded = (book: Book) => {
    setShowForm(false);
  };

  const handleBookUpdated = (book: Book) => {
    setEditingBooks(null);
    setShowForm(false);
  };

  const handleEditBook = (book: Book) => {
    setEditingBooks(book);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingBooks(null);
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
          <AddBookForm
            editingBook={editingBooks}
            onBookAdded={handleBookAdded}
            onBookUpdated={handleBookUpdated}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
            >
              Shto Librin të Ri
            </button>
          </div>
        )}

        <BookList
          onEditBook={handleEditBook}
          //   onBookDeleted={handleBookDeleted}
        />
      </div>
    </div>
  );
};

export default BookManagment;
