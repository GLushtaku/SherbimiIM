import { User } from "../../lib/api";

export type UserRole = "CLIENT" | "BUSINESS" | "ADMIN";

// Role checking utilities
export const hasRole = (
  user: User | null,
  requiredRoles: UserRole | UserRole[]
): boolean => {
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role as UserRole);
};

export const isClient = (user: User | null): boolean => {
  return hasRole(user, "CLIENT");
};

export const isBusiness = (user: User | null): boolean => {
  return hasRole(user, "BUSINESS");
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, "ADMIN");
};

export const isAuthenticated = (user: User | null): boolean => {
  return !!user;
};

// Permission checking utilities
export const canApplyToServices = (user: User | null): boolean => {
  return isClient(user);
};

export const canManageServices = (user: User | null): boolean => {
  return isBusiness(user) || isAdmin(user);
};

export const canViewDashboard = (user: User | null): boolean => {
  return isBusiness(user) || isAdmin(user);
};

export const canViewProfile = (user: User | null): boolean => {
  return isClient(user) || isAdmin(user);
};

export const canManageUsers = (user: User | null): boolean => {
  return isAdmin(user);
};

// Role-based redirect utilities
export const getDefaultRedirectPath = (user: User | null): string => {
  if (!user) return "/login";

  switch (user.role) {
    case "CLIENT":
      return "/";
    case "BUSINESS":
      return "/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
};

// Role display utilities
export const getRoleDisplayName = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    CLIENT: "Klient",
    BUSINESS: "Biznes",
    ADMIN: "Administrator",
  };
  return roleMap[role] || role;
};

export const getRoleColor = (role: string): string => {
  const colorMap: { [key: string]: string } = {
    CLIENT: "text-blue-600",
    BUSINESS: "text-green-600",
    ADMIN: "text-purple-600",
  };
  return colorMap[role] || "text-gray-600";
};
