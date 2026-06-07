import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuthContext } from "./AuthContext";

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <LoadingSpinner size="lg" label="Verificando sessão…" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
