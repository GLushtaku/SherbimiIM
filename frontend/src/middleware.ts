import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Define protected routes and their required roles/userTypes
  const protectedRoutes: { [key: string]: string[] } = {
    "/dashboard": ["BUSINESS"],
    "/profile": ["CLIENT"], // ➝ vetëm user me role CLIENT lejohet
  };

  const pathname = url.pathname;

  // Check if the route is protected
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const cookieHeader = req.headers.get("cookie") || "";

  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const data = await response.json();

    // Check if user exists and has the required role/userType
    if (!data.user || !data.user.role) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (!requiredRoles.includes(data.user.role)) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Middleware auth error:", error);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher: Apply middleware only to specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // ➝ mbulo /dashboard dhe /profile
};
