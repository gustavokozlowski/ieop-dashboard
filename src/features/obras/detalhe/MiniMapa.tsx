import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { createMarkerIcon, getRiscoNivel } from "../../mapa/mapaUtils";
import styles from "./MiniMapa.module.css";

interface MiniMapaProps {
  lat: number;
  lng: number;
  prob_atraso: number;
  endereco?: string;
}

// adaptObraDetalhe usa `latitude ?? 0`, então obras sem geolocalização chegam
// como [0,0] (oceano, Golfo da Guiné). Renderizar um mapa nesse ponto mostra
// um quadro vazio enganoso — tratamos como "sem coordenadas".
function hasValidCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

export function MiniMapa({ lat, lng, prob_atraso, endereco }: MiniMapaProps) {
  const temCoords = hasValidCoords(lat, lng);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Localização</div>

      {temCoords ? (
        <MapContainer
          className={styles.map}
          center={[lat, lng]}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Marker position={[lat, lng]} icon={createMarkerIcon(getRiscoNivel(prob_atraso))} />
        </MapContainer>
      ) : (
        <div className={styles.placeholder}>Coordenadas não informadas para esta obra.</div>
      )}

      {endereco && (
        <div className={styles.address} title={endereco}>
          {endereco}
        </div>
      )}
    </div>
  );
}
