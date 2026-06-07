import "leaflet/dist/leaflet.css";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import styles from "./MacaeMap.module.css";
import { MapLegend } from "./MapLegend";
import { MarkerPopup } from "./MarkerPopup";
import macaeBoundary from "./macae.geojson.json";
import { createClusterIcon, createMarkerIconByIEOP, getRiscoNivel } from "./mapaUtils";
import type { ObraMapPoint } from "./types";

const MACAE_CENTER: [number, number] = [-22.37, -41.78];
const MACAE_ZOOM = 11;

const BOUNDARY_STYLE = {
  color: "#2a2f42",
  weight: 2,
  fillColor: "#1e2436",
  fillOpacity: 0.12,
};

interface MacaeMapProps {
  obras: ObraMapPoint[];
  isLoading: boolean;
}

export function MacaeMap({ obras, isLoading }: MacaeMapProps) {
  if (isLoading) {
    return (
      <div
        className={styles.mapWrapper}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <LoadingSpinner size="lg" label="Carregando mapa…" />
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        className={styles.map}
        center={MACAE_CENTER}
        zoom={MACAE_ZOOM}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Perímetro municipal de Macaé */}
        <GeoJSON
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={macaeBoundary as any}
          style={BOUNDARY_STYLE}
        />

        {/* Marcadores agrupados */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
        >
          {obras.map((obra) => (
            <Marker
              key={obra.id}
              position={[obra.lat, obra.lng]}
              icon={createMarkerIconByIEOP(obra.ieop_score, getRiscoNivel(obra.prob_atraso))}
            >
              <Popup minWidth={240} maxWidth={300}>
                <MarkerPopup obra={obra} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <MapLegend />
    </div>
  );
}
