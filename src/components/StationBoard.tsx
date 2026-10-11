import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
import { STATIONS } from '../utils/gameData';
import type { StationData } from '../utils/gameData';
import type { TravelInfo } from '../store';

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

export function StationBoard({ currentStation, knownStations, onBoardTrain }: StationBoardProps) {
  // Filtere alle anderen bekannten Bahnhöfe (außer dem aktuellen) heraus
  const availableDestinations = Object.values(knownStations || STATIONS).filter(s => s.id !== currentStation.id);
  const [selectedDestId, setSelectedDestId] = useState<string>(availableDestinations[0]?.id || "");
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  const targetStation = Object.values(knownStations || STATIONS).find(s => s.id === selectedDestId) as StationData;

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true);
        // Using DB Transport REST API to find routes
        const res = await axios.get(`https://v6.db.transport.rest/journeys?from=${currentStation.id}&to=${selectedDestId}&results=5&stopovers=true`);
        setJourneys(res.data.journeys || []);
      } catch (err) {
        console.warn("DB API is down (503). Using fallback connections.", err);
        
        // Fallback-Verbindungen generieren, damit das Spiel immer spielbar bleibt
        const now = new Date();
        const fallbackJourneys: Journey[] = [
          {
            id: "fallback-1",
            legs: [{
              line: { name: "ICE 101" },
              origin: { name: currentStation.name },
              destination: { name: targetStation.name },
              departure: new Date(now.getTime() + 2 * 60000).toISOString(), // Abfahrt in 2 Min
              arrival: new Date(now.getTime() + 62 * 60000).toISOString(),  // 1 Std Fahrt
            }]
          },
          {
            id: "fallback-2",
            legs: [{
              line: { name: "RE 42" },
              origin: { name: currentStation.name },
              destination: { name: targetStation.name },
              departure: new Date(now.getTime() + 15 * 60000).toISOString(), // Abfahrt in 15 Min
              arrival: new Date(now.getTime() + 135 * 60000).toISOString(),  // 2 Std Fahrt
            }]
          }
        ];
        
        setJourneys(fallbackJourneys);
      } finally {
        setLoading(false);
      }
    };
    fetchJourneys();
  }, [currentStation.id, selectedDestId, targetStation.name]);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', background: '#fff' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <MapPin size={24} color="var(--accent)" />
          Wohin möchtest du reisen?
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {availableDestinations.map(dest => (
            <button
              key={dest.id}
              onClick={() => setSelectedDestId(dest.id)}
              style={{
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                border: `2px solid ${selectedDestId === dest.id ? 'var(--accent)' : 'var(--glass-border)'}`,
                background: selectedDestId === dest.id ? 'rgba(232, 67, 147, 0.1)' : '#f8f9fa',
                color: selectedDestId === dest.id ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      <h3 style={{ margin: '2rem 0 1rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        <Clock size={20} />
        Nächste Verbindungen nach {targetStation.name}
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
              <div key={j.id || i} style={{ 
                background: '#f8f9fa', 
                border: '1px solid var(--glass-border)',
                borderRadius: '12px', 
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem' }}>
                    {trainName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <span>Abfahrt: <strong style={{ color: 'var(--text-main)' }}>{dep.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    <ArrowRight size={16} />
                    <span>Ankunft: <strong style={{ color: 'var(--text-main)' }}>{arr.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
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

                    onBoardTrain({
                      trainName: trainName,
                      departureTime: firstLeg.departure,
                      arrivalTime: lastLeg.arrival,
                      targetStation: targetStation,
                      stopovers: parsedStopovers
                    });
                  }}
                >
                  Einsteigen
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
