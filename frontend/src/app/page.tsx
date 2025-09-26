"use client";

import BookList from "@/components/BookList";
import AuthorManagement from "@/components/AuthorManagement";
export default function MainPage() {
  return (
    <div className="min-h-screen bg-gray-00 py-8">
      <div className="container mx-auto px-4">
        <AuthorManagement />
      </div>
    </div>
  );
}
