import { useGameState } from './store';
import { GAME_LEVELS } from './utils/gameData';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { TravelView } from './components/TravelView';
import { LogicalPuzzle } from './components/LogicalPuzzle';
import { LogOut, Trophy } from 'lucide-react';

function App() {
  const { 
    state, 
    login, 
    logout, 
    startTravel, 
    arrive, 
    startPuzzle, 
    completePuzzle 
  } = useGameState();

  if (!state.isLoggedIn) {
    return <Login onLogin={login} />;
  }

  const currentLevel = GAME_LEVELS[state.levelIndex];

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
        <button onClick={logout} style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <LogOut size={20} /> Abmelden
        </button>
      </header>

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
            targetStationId={state.targetStationId}
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
              <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Du hast den Bahnhof erreicht. Ein neues Rätsel wartet auf dich.</p>
              <button className="btn" onClick={startPuzzle}>Rätsel starten</button>
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
