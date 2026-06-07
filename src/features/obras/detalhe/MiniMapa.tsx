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

export function MiniMapa({ lat, lng, prob_atraso, endereco }: MiniMapaProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Localização</div>

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

      {endereco && (
        <div className={styles.address} title={endereco}>
          {endereco}
        </div>
      )}
    </div>
  );
}
