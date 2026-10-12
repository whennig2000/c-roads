import { useState } from 'react';
import { useGameState } from './store';
import { GAME_LEVELS, STATIONS } from './utils/gameData';
import type { StationData } from './utils/gameData';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { TravelView } from './components/TravelView';
import { LogicalPuzzle } from './components/LogicalPuzzle';
import { LogOut, Trophy, Award, X, RotateCcw, Map, BookOpen } from 'lucide-react';

function App() {
  const { 
    state, 
    login, 
    logout, 
    startTravel, 
    arrive, 
    arriveAt,
    cancelTravel,
    completePuzzle,
    collectClue,
    updatePuzzleGrid,
    addGummyScore,
    resetGame
  } = useGameState();
  
  const [showBadges, setShowBadges] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);

  if (!state.isLoggedIn) {
    return <Login onLogin={login} />;
  }

  const currentLevel = GAME_LEVELS[state.levelIndex];
  const currentClueStation = currentLevel?.clueStations[state.clueIndex];
  const targetStation = currentClueStation ? Object.values(STATIONS).find(s => s.id === currentClueStation.stationId) : null;

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
          <div style={{ display: 'flex', gap: '1rem' }}>
            {state.phase !== 'PUZZLE' && (
              <button 
                onClick={() => {
                  if (state.phase === 'COMPLETED') {
                    alert('Du hast alle Hinweise gefunden! 🎉');
                  } else if (targetStation) {
                    alert(`Dein aktuelles Reiseziel lautet: Finde den Weg nach ${targetStation.name}!`);
                  } else {
                    alert('Du hast alle Hinweise gesammelt! Löse jetzt das finale Rätsel in der Rätselakte.');
                  }
                }}
                style={{ 
                  background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                }}
              >
                <Map size={20} /> Hinweis
              </button>
            )}
            
            <button onClick={() => setShowPuzzleModal(true)} style={{ 
              background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}>
              <BookOpen size={20} /> Rätselakte
            </button>
            
            <button onClick={() => setShowBadges(true)} style={{ 
              background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}>
              <Award size={20} /> Abzeichen
            </button>
          </div>
          
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
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', position: 'relative', background: '#fff', maxHeight: '80vh', overflowY: 'auto' }}>
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
              {Object.values(
                Object.values(state.knownStations || STATIONS).reduce((acc, station) => {
                  if (!acc[station.name]) {
                    acc[station.name] = { ...station, visited: false };
                  }
                  if (state.visitedStations?.includes(station.id)) {
                    acc[station.name].visited = true;
                  }
                  return acc;
                }, {} as Record<string, StationData & {visited: boolean}>)
              ).map(station => {
                const visited = station.visited;
                return (
                  <div key={station.name} style={{ 
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

      {/* PUZZLE MODAL */}
      {showPuzzleModal && state.phase !== 'COMPLETED' && (
        <div className="flex-center animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 100, padding: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', width: '100%', position: 'relative', background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowPuzzleModal(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen color="var(--accent)" /> Aktuelle Rätselakte
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Du kannst jederzeit in diese Akte schauen und dir Notizen machen.
            </p>
            {currentLevel ? (
              <LogicalPuzzle 
                data={currentLevel.logical}
                collectedClues={state.collectedClues}
                gridState={state.puzzleGrid}
                onGridChange={updatePuzzleGrid}
                onSolve={() => {
                  setShowPuzzleModal(false);
                  completePuzzle();
                }}
              />
            ) : (
              <p>Alle Rätsel wurden erfolgreich gelöst!</p>
            )}
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

        {state.phase === 'MAP' && (
          <MapView 
            currentStation={state.currentStation}
            knownStations={state.knownStations}
            onBoardTrain={startTravel}
          />
        )}

        {state.phase === 'TRAVELING' && state.travelInfo && (
          <TravelView 
            info={state.travelInfo}
            currentStation={state.currentStation}
            gummyScore={state.gummyScore}
            onArrive={arrive}
            onArriveAt={arriveAt}
            onCancel={cancelTravel}
            onAddGummyScore={addGummyScore}
          />
        )}

        {state.phase === 'ARRIVED' && (
          <div className="flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ankunft in {state.currentStation.name}!</h2>
              
              {currentClueStation && state.currentStation.id === currentClueStation.stationId ? (
                <>
                  <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Du hast einen neuen Hinweis gefunden!
                  </p>
                  <div style={{ padding: '1rem', background: 'rgba(0,184,148,0.1)', border: '1px solid var(--success)', borderRadius: '8px', marginBottom: '2rem' }}>
                    <strong>Hinweis:</strong> {currentClueStation.text}
                  </div>
                  <button className="btn" onClick={() => {
                    collectClue(currentClueStation.text);
                    cancelTravel();
                  }}>
                    Hinweis einsammeln & Weiterreisen
                  </button>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Du hast einen Bahnhof besucht und ein neues Abzeichen gesammelt! <br/>
                    Aber der Hinweis, den du suchst, ist hier nicht.
                  </p>
                  <button className="btn" onClick={cancelTravel}>
                    Weiterreisen
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer style={{ 
        padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem',
        borderTop: '1px solid var(--glass-border)', marginTop: 'auto', background: 'rgba(255,255,255,0.5)'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          Zugdaten bereitgestellt von der <a href="https://v6.db.transport.rest/" target="_blank" rel="noreferrer" style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 600}}>DB Rest API v6</a>
        </p>
        <p>
          Quellcode auf <a href="https://github.com/whennig2000/c-roads" target="_blank" rel="noreferrer" style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 600}}>GitHub</a> | Powered by <strong>Antigravity</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
