import { MapContainer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { useGermanyGeoJSON } from '../utils/useGermanyGeoJSON';
import type { StationData } from '../utils/gameData';
import { StationBoard } from './StationBoard';
import type { TravelInfo } from '../store';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in react
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  currentStation: StationData;
  knownStations?: Record<string, StationData>;
  onBoardTrain: (info: TravelInfo) => void;
}

export function MapView({ currentStation, knownStations, onBoardTrain }: MapViewProps) {
  const geoJsonData = useGermanyGeoJSON();
  
  return (
    <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
        backgroundImage: 'url(./images/station.jpg)', backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.5)'
      }} />
      <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.85)', borderRadius: '20px', backdropFilter: 'blur(10px)', marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <MapPin size={32} color="var(--accent)" />
        <div>
          <h2 style={{ fontSize: '2rem' }}>Du bist in {currentStation.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Wähle einen Zug auf der Abfahrtstafel, um deine Reise fortzusetzen.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* MAP */}
        <div style={{ height: '500px', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#f8f9fa' }}>
          <MapContainer 
            bounds={[[47.27, 5.86], [55.05, 15.04]]}
            style={{ height: '100%', width: '100%', background: '#e1f5fe' }} // Light blue for water background
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
          >
            {geoJsonData && (
              <GeoJSON 
                data={geoJsonData} 
                style={{
                  fillColor: '#ffffff',
                  weight: 2,
                  opacity: 1,
                  color: '#b0bec5',
                  fillOpacity: 1
                }}
              />
            )}
            
            <Marker position={currentStation.coords}>
              <Popup>Aktueller Standort: {currentStation.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* STATION BOARD */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <StationBoard 
            currentStation={currentStation} 
            knownStations={knownStations}
            onBoardTrain={onBoardTrain} 
          />
        </div>
        </div>
      </div>
    </div>
  );
}
