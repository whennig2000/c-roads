import React from 'react';
import type { LogicalData } from '../utils/gameData';
import { CheckCircle2 } from 'lucide-react';

export type CellState = 'empty' | 'x' | 'o';

interface LogicalPuzzleProps {
  data: LogicalData;
  collectedClues: string[];
  gridState: Record<string, CellState>;
  onGridChange: (grid: Record<string, CellState>) => void;
  onSolve: () => void;
}

export function LogicalPuzzle({ data, collectedClues, gridState, onGridChange, onSolve }: LogicalPuzzleProps) {
  const cat1 = data.categories[0];
  const cat2 = data.categories[1];

  const toggleCell = (item1: string, item2: string) => {
    const key = `${item1}-${item2}`;
    const current = gridState[key] || 'empty';
    let next: CellState = 'empty';
    if (current === 'empty') next = 'x';
    else if (current === 'x') next = 'o';
    else next = 'empty';
    
    const newState = { ...gridState, [key]: next };
    onGridChange(newState);
    checkSolution(newState);
  };

  const checkSolution = (state: Record<string, CellState>) => {
    let isCorrect = true;
    
    // Check if every solution pair is marked with 'o'
    for (const [key1, key2] of Object.entries(data.solution)) {
      if (state[`${key1}-${key2}`] !== 'o') {
        isCorrect = false;
        break;
      }
    }
    
    // Check if there are no false 'o's
    if (isCorrect) {
      for (const [key, value] of Object.entries(state)) {
        if (value === 'o') {
          const [k1, k2] = key.split('-');
          if (data.solution[k1] !== k2) {
            isCorrect = false;
            break;
          }
        }
      }
    }

    if (isCorrect) {
      setTimeout(onSolve, 1000);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>{data.title}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Gesammelte Hinweise:</h3>
            {collectedClues.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Du hast noch keine Hinweise gefunden.</p>
            ) : (
              <ul style={{ listStylePosition: 'inside', lineHeight: '1.6', background: 'rgba(0,184,148,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--success)' }}>
                {collectedClues.map((clue, i) => (
                  <li key={i}>{clue}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Klicke auf die Felder, um sie zu markieren. (1x = X, 2x = O)
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `auto ${'1fr '.repeat(cat2.items.length)}`,
              gap: '2px',
              background: 'var(--glass-border)',
              padding: '2px',
              borderRadius: '8px'
            }}>
              {/* Top Header Row */}
              <div className="logical-header" style={{ background: 'transparent' }}></div>
              {cat2.items.map(i2 => (
                <div key={i2} className="logical-header">{i2}</div>
              ))}
              
              {/* Rows */}
              {cat1.items.map(i1 => (
                <React.Fragment key={i1}>
                  <div className="logical-header" style={{ justifyContent: 'flex-start' }}>{i1}</div>
                  {cat2.items.map(i2 => {
                    const cell = gridState[`${i1}-${i2}`] || 'empty';
                    return (
                      <div 
                        key={i2} 
                        className={`logical-cell ${cell !== 'empty' ? 'state-' + cell : ''}`}
                        onClick={() => toggleCell(i1, i2)}
                      >
                        {cell === 'x' && '✕'}
                        {cell === 'o' && <CheckCircle2 size={24} />}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
