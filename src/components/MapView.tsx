import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { STATIONS } from '../utils/gameData';
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
  targetStationId: string;
  nextHint: string;
  onBoardTrain: (info: TravelInfo) => void;
}

export function MapView({ currentStation, targetStationId, nextHint, onBoardTrain }: MapViewProps) {
  const targetStation = Object.values(STATIONS).find(s => s.id === targetStationId)!;
  
  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <MapPin size={32} color="var(--accent)" />
        <div>
          <h2 style={{ fontSize: '2rem' }}>Du bist in {currentStation.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Hinweis: {nextHint}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* MAP */}
        <div style={{ height: '500px', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          <MapContainer 
            center={currentStation.coords} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            
            <Marker position={currentStation.coords}>
              <Popup>Aktueller Standort: {currentStation.name}</Popup>
            </Marker>
            
            <Marker position={targetStation.coords}>
              <Popup>Ziel: {targetStation.name}</Popup>
            </Marker>

            <Polyline 
              positions={[currentStation.coords, targetStation.coords]} 
              pathOptions={{ color: 'var(--accent)', weight: 4, dashArray: '10, 10' }} 
            />
          </MapContainer>
        </div>

        {/* STATION BOARD */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <StationBoard 
            currentStation={currentStation} 
            targetStationId={targetStationId} 
            onBoardTrain={onBoardTrain} 
          />
        </div>
      </div>
    </div>
  );
}
