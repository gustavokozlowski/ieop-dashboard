import { PageLayout } from "../components/PageLayout";
import { Mapa3D } from "../features/mapa/Mapa3D";
import styles from "../features/mapa/MapaPage.module.css";
import { useMapaObras } from "../features/mapa/useMapa";

export function Mapa3DPage() {
  const { data: obras = [], isLoading } = useMapaObras();
  const comCoords = obras.filter((o) => o.lat !== 0 && o.lng !== 0);

  return (
    <PageLayout pageTitle="Mapa 3D" breadcrumb="Macaé / Relatórios / Mapa 3D">
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <span className={styles.pageTitle}>Mapa 3D — Macaé</span>
            <span className={styles.pageSubtitle}>
              {isLoading
                ? "Carregando…"
                : `${comCoords.length} obra${comCoords.length !== 1 ? "s" : ""} georreferenciada${comCoords.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <Mapa3D obras={comCoords} />
      </div>
    </PageLayout>
  );
}
