import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, ArrowRight } from 'lucide-react';
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
  }[];
}

interface StationBoardProps {
  currentStation: StationData;
  targetStationId: string;
  onBoardTrain: (info: TravelInfo) => void;
}

export function StationBoard({ currentStation, targetStationId, onBoardTrain }: StationBoardProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const targetStation = Object.values(STATIONS).find(s => s.id === targetStationId)!;

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true);
        // Using DB Transport REST API to find routes
        const res = await axios.get(`https://v6.db.transport.rest/journeys?from=${currentStation.id}&to=${targetStationId}&results=5`);
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
  }, [currentStation.id, targetStationId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Lade Verbindungen...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent)' }}>Fehler beim Laden der Verbindungen.</div>;

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={24} color="var(--accent)" />
        Nächste Verbindungen nach {targetStation.name}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {journeys.length === 0 && <p>Keine Verbindungen gefunden.</p>}
        {journeys.map((j, i) => {
          // Find first and last leg to determine overall time
          const firstLeg = j.legs[0];
          const lastLeg = j.legs[j.legs.length - 1];
          const trainName = firstLeg.line?.name || 'Zug';
          
          const dep = new Date(firstLeg.departure);
          const arr = new Date(lastLeg.arrival);

          return (
            <div key={j.id || i} style={{ 
              background: 'rgba(0,0,0,0.2)', 
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
                  <span>Abfahrt: <strong style={{ color: 'white' }}>{dep.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  <ArrowRight size={16} />
                  <span>Ankunft: <strong style={{ color: 'white' }}>{arr.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>
              
              <button 
                className="btn"
                onClick={() => onBoardTrain({
                  trainName: trainName,
                  departureTime: firstLeg.departure,
                  arrivalTime: lastLeg.arrival,
                  targetStation: targetStation
                })}
              >
                Einsteigen
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
