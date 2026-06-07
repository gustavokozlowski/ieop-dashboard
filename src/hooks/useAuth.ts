// Thin re-export so existing imports from hooks/useAuth keep working.

export type { AuthUser } from "../auth/AuthContext";
export { useAuthContext as useAuth } from "../auth/AuthContext";
