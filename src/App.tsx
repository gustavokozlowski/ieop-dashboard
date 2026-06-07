import "./index.css";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import { PrivateRoute } from "./auth/PrivateRoute";
import { RagRoute } from "./auth/RagRoute";
import { RegisterPage } from "./auth/RegisterPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { lazyWithReload } from "./components/lazyWithReload";

// Code-splitting por rota: mantém fora do bundle inicial as deps pesadas
// (recharts no dashboard/perfil, leaflet no mapa/detalhe, deck.gl no 3D, chat).
// Login/cadastro ficam eager por serem a entrada de quem não está autenticado.
// lazyWithReload recarrega 1x se um chunk antigo sumir após um deploy.
const Dashboard = lazyWithReload(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const ObrasPage = lazyWithReload(() =>
  import("./pages/ObrasPage").then((m) => ({ default: m.ObrasPage })),
);
const ObraDetalhePage = lazyWithReload(() =>
  import("./pages/ObraDetalhePage").then((m) => ({ default: m.ObraDetalhePage })),
);
const FornecedoresPage = lazyWithReload(() =>
  import("./pages/FornecedoresPage").then((m) => ({ default: m.FornecedoresPage })),
);
const FornecedorPerfilPage = lazyWithReload(() =>
  import("./pages/FornecedorPerfilPage").then((m) => ({ default: m.FornecedorPerfilPage })),
);
const MapaPage = lazyWithReload(() =>
  import("./pages/MapaPage").then((m) => ({ default: m.MapaPage })),
);
const Mapa3DPage = lazyWithReload(() =>
  import("./pages/Mapa3DPage").then((m) => ({ default: m.Mapa3DPage })),
);

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" label="Carregando…" />}>
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
            <Route path="/mapa-3d" element={<Mapa3DPage />} />
            <Route path="/*" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
