import { type ComponentType, lazy } from "react";

const KEY = "chunkReloadAttempted";

// Envolve React.lazy com retry-via-reload. Se o import() de um chunk falhar
// — caso clássico de SPA: a aba ficou aberta durante um deploy e o hash do
// chunk antigo não existe mais — recarrega a página UMA vez para buscar o
// index.html/chunks novos. Se falhar de novo após o reload, propaga o erro
// para o ErrorBoundary (evita loop de reload). Sucesso limpa o guard.
export function lazyWithReload<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory()
      .then((mod) => {
        sessionStorage.removeItem(KEY);
        return mod;
      })
      .catch((err: unknown) => {
        if (sessionStorage.getItem(KEY)) throw err;
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
        // Mantém o Suspense pendente enquanto a página recarrega.
        return new Promise<{ default: T }>(() => {});
      }),
  );
}
