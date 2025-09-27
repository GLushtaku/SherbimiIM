"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "../hooks/useRole";
import { RoleBasedContent } from "./RoleGuard";

const WelcomeMessage: React.FC = () => {
  const { getRoleDisplayName, getRoleColor } = useRole();
  const { user, isLoading, logout } = useAuth();

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Mirë se erdhe në <span className="text-blue-600">Sherbimi IM</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Platforma më e mirë për të gjetur dhe rezervuar shërbime të cilësisë së
        lartë në Kosovë. Zgjidh nga mijëra shërbime të verifikuara dhe rezervo
        takimin me nje klik te vetem
      </p>

      <RoleBasedContent
        unauthenticated={
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-3">
              Mirë se erdhe!
            </h2>
            <p className="text-blue-700 mb-6 text-lg">
              Regjistrohu ose hyr në llogarinë tënde për të përdorur shërbimet
              tona dhe të rezervosh takime me biznese të cilësisë së lartë.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Hyr në Llogari
              </button>
              <button
                onClick={() => (window.location.href = "/register")}
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Regjistrohu
              </button>
            </div>
          </div>
        }
        client={
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-green-800 mb-3">
              Mirë se erdhe,{" "}
              <span className={getRoleColor()}>{user?.name}</span>!
            </h2>
            <p className="text-green-700 mb-6 text-lg">
              Tani mund të aplikosh për shërbime, të shohësh rezervimet e tua
              dhe të menaxhosh profilin tënd. Zgjidh nga kategoritë më poshtë
              për të filluar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/services")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Shiko Shërbimet
              </button>
              <button
                onClick={() => (window.location.href = "/profile")}
                className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Profili Im
              </button>
            </div>
          </div>
        }
        business={
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold text-purple-800 mb-3">
              Mirë se erdhe,{" "}
              <span className={getRoleColor()}>{user?.name}</span>!
            </h2>
            <p className="text-purple-700 mb-6 text-lg">
              Menaxho shërbimet e tua, shto punonjës të rinj dhe shiko
              rezervimet e klientëve. Rrit biznesin tënd me platformën tonë!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => (window.location.href = "/services")}
                className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                Menaxho Shërbimet
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default WelcomeMessage;
