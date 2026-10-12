import { useState, useEffect, useCallback } from 'react';

const EMOJIS = ['🚂', '🚆', '🚄', '🚇', '🚋'];
const SPECIAL_4 = '💛';
const SPECIAL_5 = '❤️';
const SIZE = 8;

interface GummyMatchProps {
  onScore: (pts: number) => void;
}

export function GummyMatch({ onScore }: GummyMatchProps) {
  const [grid, setGrid] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const createGrid = () => {
    const newGrid = Array(SIZE * SIZE).fill('');
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        let valid = [...EMOJIS];
        if (c >= 2 && newGrid[r * SIZE + c - 1] === newGrid[r * SIZE + c - 2]) {
          valid = valid.filter(e => e !== newGrid[r * SIZE + c - 1]);
        }
        if (r >= 2 && newGrid[(r - 1) * SIZE + c] === newGrid[(r - 2) * SIZE + c]) {
          valid = valid.filter(e => e !== newGrid[(r - 1) * SIZE + c]);
        }
        newGrid[r * SIZE + c] = valid[Math.floor(Math.random() * valid.length)];
      }
    }
    return newGrid;
  };

  useEffect(() => {
    setGrid(createGrid());
  }, []);

  const analyzeGrid = (currentGrid: string[]) => {
    const matches = new Set<number>();
    const spawns = new Map<number, string>(); // idx -> emoji

    const addMatch = (indices: number[], len: number) => {
      indices.forEach(i => matches.add(i));
      if (len === 4 && !spawns.has(indices[1])) spawns.set(indices[1], SPECIAL_4);
      if (len >= 5 && !spawns.has(indices[2])) spawns.set(indices[2], SPECIAL_5);
    };

    // Horizontal
    for (let r = 0; r < SIZE; r++) {
      let c = 0;
      while (c < SIZE - 2) {
        const type = currentGrid[r * SIZE + c];
        if (type && type !== SPECIAL_4 && type !== SPECIAL_5) {
          let len = 1;
          while (c + len < SIZE && currentGrid[r * SIZE + c + len] === type) len++;
          if (len >= 3) {
            const arr = [];
            for (let i = 0; i < len; i++) arr.push(r * SIZE + c + i);
            addMatch(arr, len);
          }
          c += len;
        } else {
          c++;
        }
      }
    }

    // Vertical
    for (let c = 0; c < SIZE; c++) {
      let r = 0;
      while (r < SIZE - 2) {
        const type = currentGrid[r * SIZE + c];
        if (type && type !== SPECIAL_4 && type !== SPECIAL_5) {
          let len = 1;
          while (r + len < SIZE && currentGrid[(r + len) * SIZE + c] === type) len++;
          if (len >= 3) {
            const arr = [];
            for (let i = 0; i < len; i++) arr.push((r + i) * SIZE + c);
            addMatch(arr, len);
          }
          r += len;
        } else {
          r++;
        }
      }
    }

    return { matches, spawns };
  };

  const processCascade = useCallback((initialGrid: string[], initialScore = 0) => {
    let currentGrid = [...initialGrid];
    let totalScore = initialScore;
    setProcessing(true);

    const loop = () => {
      let { matches, spawns } = analyzeGrid(currentGrid);
      
      let holesCount = 0;
      for (let i = 0; i < SIZE * SIZE; i++) {
        if (currentGrid[i] === '') holesCount++;
      }

      if (matches.size === 0 && holesCount === 0) {
        setProcessing(false);
        setGrid(currentGrid);
        if (totalScore > 0) onScore(totalScore);
        return;
      }

      if (matches.size > 0) {
        totalScore += matches.size * 10;
        matches.forEach(idx => {
          currentGrid[idx] = '';
        });
        spawns.forEach((emoji, idx) => {
          currentGrid[idx] = emoji;
        });
      }

      // Drop down
      for (let c = 0; c < SIZE; c++) {
        let column = [];
        for (let r = 0; r < SIZE; r++) {
          if (currentGrid[r * SIZE + c] !== '') {
            column.push(currentGrid[r * SIZE + c]);
          }
        }
        while (column.length < SIZE) {
          column.unshift(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
        }
        for (let r = 0; r < SIZE; r++) {
          currentGrid[r * SIZE + c] = column[r];
        }
      }

      setTimeout(() => {
        setGrid([...currentGrid]);
        loop();
      }, 300);
    };

    loop();
  }, [onScore]);

  // Initial check
  useEffect(() => {
    if (grid.length > 0 && !processing) {
      const { matches } = analyzeGrid(grid);
      if (matches.size > 0) {
        processCascade(grid);
      }
    }
  }, [grid, processing, processCascade]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (processing) return;
    setSelected(idx);
    e.dataTransfer.setData('text/plain', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const attemptSwap = (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) {
      setSelected(null);
      return;
    }

    const isAdjacent = 
      targetIdx === sourceIdx - 1 && sourceIdx % SIZE !== 0 || // left
      targetIdx === sourceIdx + 1 && (sourceIdx + 1) % SIZE !== 0 || // right
      targetIdx === sourceIdx - SIZE || // up
      targetIdx === sourceIdx + SIZE; // down

    if (isAdjacent) {
      const sourceEmoji = grid[sourceIdx];
      const targetEmoji = grid[targetIdx];
      
      const newGrid = [...grid];
      newGrid[sourceIdx] = targetEmoji;
      newGrid[targetIdx] = sourceEmoji;

      let exploded = false;
      const toDestroy = new Set<number>();
      
      const evaluateSpecial = (emoji: string, idx: number) => {
        if (emoji === SPECIAL_4) {
          exploded = true;
          const r = Math.floor(idx / SIZE);
          const c = idx % SIZE;
          for (let i = 0; i < SIZE; i++) {
            toDestroy.add(r * SIZE + i);
            toDestroy.add(i * SIZE + c);
          }
        }
        if (emoji === SPECIAL_5) {
          exploded = true;
          const r = Math.floor(idx / SIZE);
          const c = idx % SIZE;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                toDestroy.add(nr * SIZE + nc);
              }
            }
          }
        }
      };

      evaluateSpecial(sourceEmoji, targetIdx);
      evaluateSpecial(targetEmoji, sourceIdx);

      if (exploded) {
        toDestroy.forEach(idx => { newGrid[idx] = ''; });
        setSelected(null);
        setGrid(newGrid);
        processCascade(newGrid, toDestroy.size * 10);
      } else {
        const { matches } = analyzeGrid(newGrid);
        if (matches.size > 0) {
          setGrid(newGrid);
          setSelected(null);
        } else {
          setSelected(null);
        }
      }
    } else {
      setSelected(null);
    }
  };

  const handleCellClick = (idx: number) => {
    if (processing) return;
    if (selected === null) {
      setSelected(idx);
    } else {
      attemptSwap(selected, idx);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>Com-Bahn-i</h3>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`, 
          gap: '2px',
          width: '100%',
          maxWidth: '450px',
          margin: '0 auto',
          background: 'rgba(0,0,0,0.05)',
          padding: '4px',
          borderRadius: '12px'
        }}
      >
        {grid.map((emoji, idx) => (
          <div 
            key={idx}
            draggable={!processing}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.preventDefault();
              if (processing || selected === null) return;
              attemptSwap(selected, idx);
            }}
            onClick={() => handleCellClick(idx)}
            style={{ 
              width: '100%', 
              aspectRatio: '1', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1rem, 6vw, 1.8rem)',
              cursor: processing ? 'default' : 'grab',
              opacity: emoji === '' ? 0 : 1,
              transition: 'all 0.2s ease',
              transform: selected === idx ? 'scale(1.1)' : 'scale(1)',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.4)',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Ziehe die Symbole oder klicke nacheinander auf zwei, um sie zu verbinden!
      </p>
    </div>
  );
}
