import React, { useState } from 'react';
import type { LogicalData } from '../utils/gameData';
import { CheckCircle2 } from 'lucide-react';

interface LogicalPuzzleProps {
  data: LogicalData;
  onSolve: () => void;
}

type CellState = 'empty' | 'x' | 'o';

export function LogicalPuzzle({ data, onSolve }: LogicalPuzzleProps) {
  const [gridState, setGridState] = useState<Record<string, CellState>>({});
  
  const cat1 = data.categories[0];
  const cat2 = data.categories[1];

  const toggleCell = (item1: string, item2: string) => {
    const key = `${item1}-${item2}`;
    setGridState(prev => {
      const current = prev[key] || 'empty';
      let next: CellState = 'empty';
      if (current === 'empty') next = 'x';
      else if (current === 'x') next = 'o';
      else next = 'empty';
      
      const newState = { ...prev, [key]: next };
      checkSolution(newState);
      return newState;
    });
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
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', width: '100%' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}>{data.title}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Hinweise:</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.6' }}>
              {data.clues.map((clue, i) => (
                <li key={i}>{clue.text}</li>
              ))}
            </ul>
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
    </div>
  );
}
