import "./index.css";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import { PrivateRoute } from "./auth/PrivateRoute";
import { RagRoute } from "./auth/RagRoute";
import { RegisterPage } from "./auth/RegisterPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Dashboard } from "./pages/Dashboard";
import { FornecedoresPage } from "./pages/FornecedoresPage";
import { FornecedorPerfilPage } from "./pages/FornecedorPerfilPage";
import { MapaPage } from "./pages/MapaPage";
import { ObraDetalhePage } from "./pages/ObraDetalhePage";
import { ObrasPage } from "./pages/ObrasPage";

// deck.gl é pesado (~2 MB); carregamos a página 3D sob demanda para não
// inflar o bundle inicial de quem nunca abre o mapa 3D.
const Mapa3DPage = lazy(() =>
  import("./pages/Mapa3DPage").then((m) => ({ default: m.Mapa3DPage })),
);

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraDetalhePage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route path="/fornecedores/:id" element={<FornecedorPerfilPage />} />
          <Route path="/ia" element={<RagRoute />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route
            path="/mapa-3d"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" label="Carregando mapa 3D…" />}>
                <Mapa3DPage />
              </Suspense>
            }
          />
          <Route path="/*" element={<Dashboard />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
