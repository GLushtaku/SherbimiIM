"use client";

import AuthorManagement from "@/components/AuthorManagement";
export default function AddAuthorPage() {
  const handleAuthorAdded = (author: any) => {
    console.log("Autor i ri u shtua:", author);
    // Këtu mund të bësh diçka tjetër, p.sh. redirect ose update list
  };

  return (
    <div className="min-h-screen bg-gray-00 py-8">
      <div className="container mx-auto px-4">
        <AuthorManagement />
      </div>
    </div>
  );
}
