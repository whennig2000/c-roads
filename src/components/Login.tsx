import { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (code: string) => boolean;
}

export function Login({ onLogin }: LoginProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(code)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <KeyRound size={48} color="var(--accent)" style={{ margin: '0 auto' }} />
          <h1 style={{ marginTop: '1rem', fontSize: '2rem' }}>Zugangscode</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Bitte gib deinen Spielstandschlüssel ein, um die Reise zu beginnen.
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Code eingeben..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ borderColor: error ? 'var(--accent)' : '' }}
          />
          {error && <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Falscher Code!</span>}
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Spiel starten
          </button>
        </form>
      </div>
    </div>
  );
}
