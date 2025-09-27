"use client";

import { useAuth } from "../contexts/AuthContext";
import {
  UserRole,
  hasRole,
  isClient,
  isBusiness,
  isAdmin,
  isAuthenticated,
  canApplyToServices,
  canManageServices,
  canViewDashboard,
  canViewProfile,
  canManageUsers,
  getDefaultRedirectPath,
  getRoleDisplayName,
  getRoleColor,
} from "../utils/roleUtils";

export const useRole = () => {
  const { user, isAuthenticated: isAuth } = useAuth();

  return {
    // User info
    user,
    isAuthenticated: isAuth,

    // Role checks
    hasRole: (roles: UserRole | UserRole[]) => hasRole(user, roles),
    isClient: () => isClient(user),
    isBusiness: () => isBusiness(user),
    isAdmin: () => isAdmin(user),

    // Permission checks
    canApplyToServices: () => canApplyToServices(user),
    canManageServices: () => canManageServices(user),
    canViewDashboard: () => canViewDashboard(user),
    canViewProfile: () => canViewProfile(user),
    canManageUsers: () => canManageUsers(user),

    // Utilities
    getDefaultRedirectPath: () => getDefaultRedirectPath(user),
    getRoleDisplayName: () => (user ? getRoleDisplayName(user.role) : ""),
    getRoleColor: () => (user ? getRoleColor(user.role) : ""),

    // Direct role access
    role: user?.role,
  };
};
