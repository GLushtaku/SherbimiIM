"use client";

import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, hasRole } from "../utils/roleUtils";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // If user doesn't have required role
  if (!hasRole(user, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const ClientOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard allowedRoles="CLIENT" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const BusinessOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard allowedRoles="BUSINESS" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard allowedRoles="ADMIN" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AuthenticatedOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard allowedRoles={["CLIENT", "BUSINESS", "ADMIN"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Component for showing different content based on role
interface RoleBasedContentProps {
  client?: ReactNode;
  business?: ReactNode;
  admin?: ReactNode;
  unauthenticated?: ReactNode;
  fallback?: ReactNode;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  client,
  business,
  admin,
  unauthenticated,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{unauthenticated || fallback}</>;
  }

  switch (user?.role) {
    case "CLIENT":
      return <>{client || fallback}</>;
    case "BUSINESS":
      return <>{business || fallback}</>;
    case "ADMIN":
      return <>{admin || fallback}</>;
    default:
      return <>{fallback}</>;
  }
};
