import { useState, useEffect } from 'react';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
import { STATIONS } from '../utils/gameData';
import type { StationData } from '../utils/gameData';
import type { TravelInfo } from '../store';
import { getLocalDepartures } from '../utils/timetables';

interface Journey {
  id: string;
  legs: {
    line?: { name: string };
    origin: { name: string };
    destination: { name: string };
    departure: string;
    arrival: string;
    stopovers?: {
      stop: { id: string; name: string; location?: { latitude: number; longitude: number } };
      arrival: string;
    }[];
  }[];
}

interface StationBoardProps {
  currentStation: StationData;
  knownStations?: Record<string, StationData>;
  onBoardTrain: (info: TravelInfo) => void;
}

export function StationBoard({ currentStation, onBoardTrain }: StationBoardProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Generate departures for the current station
    setLoading(true);
    setTimeout(() => {
      const deps = getLocalDepartures(currentStation.id);
      setJourneys(deps);
      setLoading(false);
    }, 500); // slight delay for realism
  }, [currentStation.id]);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', background: '#fff' }}>
      <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
        <MapPin size={24} color="var(--accent)" />
        Abfahrtstafel: {currentStation.name}
      </h3>

      <h3 style={{ margin: '2rem 0 1rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        <Clock size={20} />
        Nächste Abfahrten
      </h3>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Lade Verbindungen...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {journeys.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Keine Verbindungen gefunden.</p>}
          {journeys.map((j, i) => {
            const firstLeg = j.legs[0];
            const lastLeg = j.legs[j.legs.length - 1];
            const trainName = firstLeg.line?.name || 'Zug';
            
            const dep = new Date(firstLeg.departure);
            const arr = new Date(lastLeg.arrival);

            return (
              <div key={j.id || i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: expandedId === j.id ? '12px 12px 0 0' : '12px', 
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem' }}>
                      {trainName} nach {lastLeg.destination.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                      <span>Abfahrt: <strong style={{ color: 'var(--text-main)' }}>{dep.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      <ArrowRight size={16} />
                      <span>Ankunft: <strong style={{ color: 'var(--text-main)' }}>{arr.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    </div>
                    <button 
                      onClick={() => setExpandedId(expandedId === j.id ? null : j.id)}
                      style={{ 
                        background: 'none', border: 'none', padding: 0, marginTop: '0.5rem',
                        color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'
                      }}
                    >
                      {expandedId === j.id ? 'Fahrplan ausblenden' : 'Fahrplan ansehen'}
                    </button>
                  </div>
                  
                  <button 
                    className="btn"
                    onClick={() => {
                      const parsedStopovers = firstLeg.stopovers?.map(s => ({
                        station: { 
                          id: s.stop.id, 
                          name: s.stop.name, 
                          coords: s.stop.location ? [s.stop.location.latitude, s.stop.location.longitude] as [number, number] : [0,0] as [number, number] 
                        },
                        arrival: s.arrival
                      })).filter(s => s.arrival) || [];

                        const targetStationData = Object.values(STATIONS).find(s => s.name === lastLeg.destination.name) || { id: "unknown", name: lastLeg.destination.name, coords: [0,0] as [number, number] };
                        
                        onBoardTrain({
                          trainName: trainName,
                          departureTime: firstLeg.departure,
                          arrivalTime: lastLeg.arrival,
                          targetStation: targetStationData,
                          stopovers: parsedStopovers
                        });
                    }}
                  >
                    Einsteigen
                  </button>
                </div>
                
                {expandedId === j.id && (
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#fff', 
                    border: '1px solid var(--glass-border)', 
                    borderTop: 'none',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Reiseverlauf</h4>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--glass-border)' }}></div>
                      
                      <li style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '3px solid var(--accent)' }}></div>
                        <div style={{ marginTop: '-2px' }}>
                          <div style={{ fontWeight: 600 }}>{currentStation.name}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Abfahrt: {dep.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </li>
                      
                      {firstLeg.stopovers?.map((stop, sIdx) => {
                        if (stop.stop.name === currentStation.name || stop.stop.name === lastLeg.destination.name) return null;
                        const stopTime = new Date(stop.arrival);
                        return (
                          <li key={sIdx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', border: '2px solid var(--text-muted)', margin: '2px 2px' }}></div>
                            <div style={{ marginTop: '-2px' }}>
                              <div>{stop.stop.name}</div>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stopTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </li>
                        );
                      })}
                      
                      <li style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '3px solid var(--accent)' }}></div>
                        <div style={{ marginTop: '-2px' }}>
                          <div style={{ fontWeight: 600 }}>{lastLeg.destination.name}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ankunft: {arr.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
