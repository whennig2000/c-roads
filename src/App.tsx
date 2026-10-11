import { useState } from 'react';
import { useGameState } from './store';
import { GAME_LEVELS, STATIONS } from './utils/gameData';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { TravelView } from './components/TravelView';
import { LogicalPuzzle } from './components/LogicalPuzzle';
import { LogOut, Trophy, Award, X, RotateCcw } from 'lucide-react';

function App() {
  const { 
    state, 
    login, 
    logout, 
    startTravel, 
    arrive, 
    startPuzzle, 
    completePuzzle,
    resetGame
  } = useGameState();
  
  const [showBadges, setShowBadges] = useState(false);

  if (!state.isLoggedIn) {
    return <Login onLogin={login} />;
  }

  const currentLevel = GAME_LEVELS[state.levelIndex];
  const isCorrectStation = currentLevel && state.currentStation.id === currentLevel.targetStation.id;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <header style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <h1 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>
          🚂 Reise durch Deutschland
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setShowBadges(true)} style={{ 
            background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
          }}>
            <Award size={20} /> Abzeichen
          </button>
          
          <button onClick={() => {
            if (window.confirm("Bist du sicher, dass du das Spiel komplett zurücksetzen möchtest? Dein Fortschritt geht verloren und du startest wieder in Frankfurt!")) {
              resetGame();
            }
          }} style={{ 
            background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
          }}>
            <RotateCcw size={20} /> Reset
          </button>
          
          <button onClick={logout} style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <LogOut size={20} /> Abmelden
          </button>
        </div>
      </header>

      {/* BADGES MODAL */}
      {showBadges && (
        <div className="flex-center animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 100, padding: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', position: 'relative', background: '#fff' }}>
            <button 
              onClick={() => setShowBadges(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award color="var(--accent)" /> Deine besuchten Bahnhöfe
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.values(state.knownStations || STATIONS).map(station => {
                const visited = state.visitedStations?.includes(station.id);
                return (
                  <div key={station.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', 
                    padding: '1rem', borderRadius: '12px',
                    background: visited ? 'rgba(0, 184, 148, 0.1)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${visited ? 'var(--success)' : 'var(--glass-border)'}`
                  }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '20px', 
                      background: visited ? 'var(--success)' : '#ddd',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff'
                    }}>
                      {visited ? '✓' : '?'}
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: visited ? 600 : 400, color: visited ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {station.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: '80px' }}>
        {state.phase === 'COMPLETED' && (
          <div className="flex-center" style={{ minHeight: '80vh' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center', maxWidth: '600px' }}>
              <Trophy size={80} color="#f1c40f" style={{ margin: '0 auto 2rem auto' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Herzlichen Glückwunsch!</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                Papa, du hast alle Rätsel gelöst und deine Reise erfolgreich beendet! 
                Alles Gute zum Geburtstag! 🎉
              </p>
            </div>
          </div>
        )}

        {state.phase === 'MAP' && currentLevel && (
          <MapView 
            currentStation={state.currentStation}
            knownStations={state.knownStations}
            nextHint={currentLevel.nextHint}
            onBoardTrain={startTravel}
          />
        )}

        {state.phase === 'TRAVELING' && state.travelInfo && (
          <TravelView 
            info={state.travelInfo}
            currentStation={state.currentStation}
            onArrive={arrive}
          />
        )}

        {state.phase === 'ARRIVED' && (
          <div className="flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ankunft in {state.currentStation.name}!</h2>
              
              {isCorrectStation ? (
                <>
                  <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Du hast den richtigen Bahnhof erreicht! Ein neues Rätsel wartet auf dich.</p>
                  <button className="btn" onClick={startPuzzle}>Rätsel starten</button>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Du hast einen Bahnhof besucht und ein neues Abzeichen gesammelt! <br/>
                    Aber der Hinweis, den du suchst, ist hier nicht.
                  </p>
                  <button className="btn" onClick={() => completePuzzle(state.targetStationId)}>
                    Weiterreisen
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {state.phase === 'PUZZLE' && currentLevel && (
          <LogicalPuzzle 
            data={currentLevel.logical}
            onSolve={() => {
              const nextLevel = GAME_LEVELS[state.levelIndex + 1];
              completePuzzle(nextLevel ? nextLevel.targetStation.id : null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
