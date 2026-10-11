import { useEffect, useState } from 'react';
import { Train, Clock } from 'lucide-react';
import type { TravelInfo } from '../store';

interface TravelViewProps {
  info: TravelInfo;
  onArrive: () => void;
}

export function TravelView({ info, onArrive }: TravelViewProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const arrivalTime = new Date(info.arrivalTime);
  const isArrived = now >= arrivalTime;
  
  const diffMs = Math.max(0, arrivalTime.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <Train size={64} color="var(--accent)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Du bist im Zug!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.2rem' }}>
          {info.trainName} nach <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{info.targetStation.name}</span>
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--accent)', marginBottom: '1rem' }}>
            <Clock size={24} />
            <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>Ankunft um {arrivalTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Verbleibende Reisezeit</p>
        </div>

        <button 
          className="btn" 
          onClick={onArrive} 
          disabled={!isArrived}
          style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
        >
          {isArrived ? 'Jetzt Aussteigen!' : 'Zug fährt noch...'}
        </button>
      </div>
    </div>
  );
}
