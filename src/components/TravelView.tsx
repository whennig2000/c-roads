import { useEffect, useState } from 'react';
import { Train, Clock, MapPin } from 'lucide-react';
import type { TravelInfo } from '../store';
import type { StationData } from '../utils/gameData';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TravelViewProps {
  info: TravelInfo;
  currentStation: StationData;
  onArrive: () => void;
}

export function TravelView({ info, currentStation, onArrive }: TravelViewProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const departureTime = new Date(info.departureTime);
  const arrivalTime = new Date(info.arrivalTime);
  const isArrived = now >= arrivalTime;
  const isWaiting = now < departureTime;
  
  // Zeige entweder Wartezeit oder Reisezeit
  const targetTime = isWaiting ? departureTime : arrivalTime;
  const diffMs = Math.max(0, targetTime.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* MAP */}
      <div className="glass-panel animate-fade-in" style={{ height: '350px', width: '100%', overflow: 'hidden', padding: '0' }}>
        <MapContainer 
          center={[51.1657, 10.4515]} // Mitte von Deutschland
          zoom={5.5} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          <Marker position={currentStation.coords}>
            <Popup>Start: {currentStation.name}</Popup>
          </Marker>
          
          <Marker position={info.targetStation.coords}>
            <Popup>Ziel: {info.targetStation.name}</Popup>
          </Marker>

          <Polyline 
            positions={[currentStation.coords, info.targetStation.coords]} 
            pathOptions={{ color: 'var(--accent)', weight: 4, dashArray: '10, 10' }} 
          />
        </MapContainer>
      </div>

      {/* TRAVEL INFO */}
      <div className="flex-center">
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          {isWaiting ? (
            <MapPin size={64} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
          ) : (
            <Train size={64} color="var(--accent)" style={{ margin: '0 auto 1.5rem auto' }} />
          )}
          
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isWaiting ? 'Warten am Gleis...' : 'Du bist im Zug!'}
          </h2>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.2rem' }}>
            {info.trainName} nach <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{info.targetStation.name}</span>
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--accent)', marginBottom: '1rem' }}>
              <Clock size={24} />
              <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {isWaiting 
                  ? `Abfahrt um ${departureTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
                  : `Ankunft um ${arrivalTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '2px' }}>
              {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {isWaiting ? 'Verbleibende Wartezeit' : 'Verbleibende Reisezeit'}
            </p>
          </div>

          <button 
            className="btn" 
            onClick={onArrive} 
            disabled={!isArrived}
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
          >
            {isArrived ? 'Jetzt Aussteigen!' : (isWaiting ? 'Warte auf Abfahrt...' : 'Zug fährt noch...')}
          </button>
        </div>
      </div>
    </div>
  );
}
