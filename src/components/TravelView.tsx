import { useEffect, useState, useMemo } from 'react';
import { Train, Clock, MapPin, Ticket } from 'lucide-react';
import type { TravelInfo } from '../store';
import type { StationData } from '../utils/gameData';
import { MapContainer, Marker, Popup, Polyline, GeoJSON } from 'react-leaflet';
import { useGermanyGeoJSON } from '../utils/useGermanyGeoJSON';
import 'leaflet/dist/leaflet.css';

interface TravelViewProps {
  info: TravelInfo;
  currentStation: StationData;
  onArrive: () => void;
}

const getCityImageName = (stationName: string) => {
  if (stationName.includes("Hamburg")) return "hamburg.jpg";
  if (stationName.includes("Berlin")) return "berlin.jpg";
  if (stationName.includes("Leipzig")) return "leipzig.jpg";
  if (stationName.includes("München")) return "muenchen.jpg";
  return "landscape.jpg"; // Fallback
};

export function TravelView({ info, currentStation, onArrive }: TravelViewProps) {
  const [now, setNow] = useState(new Date());
  const geoJsonData = useGermanyGeoJSON();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seatNumber = useMemo(() => {
    // Generate a consistent pseudo-random seat based on train name
    const trainHash = info.trainName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const wagen = (trainHash % 14) + 1;
    const platz = (trainHash % 100) + 1;
    return `Wagen ${wagen}, Platz ${platz}`;
  }, [info.trainName]);

  const departureTime = new Date(info.departureTime);
  const arrivalTime = new Date(info.arrivalTime);
  const isArrived = now >= arrivalTime;
  const isWaiting = now < departureTime;
  
  const targetTime = isWaiting ? departureTime : arrivalTime;
  const diffMs = Math.max(0, targetTime.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // Das Bild für das "Fenster" (beim Warten die aktuelle Stadt, während der Fahrt Landschaft)
  const windowImageSrc = import.meta.env.BASE_URL + "images/" + (isWaiting ? getCityImageName(currentStation.name) : "landscape.jpg");

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SIMPLE MAP */}
      <div className="glass-panel animate-fade-in" style={{ height: '350px', width: '100%', overflow: 'hidden', padding: '0', background: '#f8f9fa' }}>
        <MapContainer 
          center={[51.1657, 10.4515]} // Mitte von Deutschland
          zoom={5.5} 
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
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                {isWaiting ? 'Warten am Gleis...' : 'Du bist im Zug!'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                {info.trainName} nach <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{info.targetStation.name}</span>
              </p>
            </div>
            {!isWaiting && (
              <div style={{ background: 'rgba(232, 67, 147, 0.1)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Ticket size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Ticket</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{seatNumber}</div>
              </div>
            )}
          </div>

          {/* ZUGFENSTER */}
          <div style={{ 
            width: '100%', 
            height: '250px', 
            borderRadius: '24px 24px 8px 8px', 
            border: '12px solid #2d3436', 
            borderBottomWidth: '24px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '2rem',
            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: '30px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
              zIndex: 2
            }} />
            <img 
              src={windowImageSrc} 
              alt="Zugfenster Ausblick" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.03)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--accent)', marginBottom: '1rem' }}>
              <Clock size={24} />
              <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {isWaiting 
                  ? `Abfahrt um ${departureTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
                  : `Ankunft um ${arrivalTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text-main)' }}>
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
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', borderRadius: '16px' }}
          >
            {isArrived ? 'Jetzt Aussteigen!' : (isWaiting ? 'Warte auf Abfahrt...' : 'Zug fährt noch...')}
          </button>
        </div>
      </div>
    </div>
  );
}
