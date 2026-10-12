import { useState, useEffect } from 'react';
import { STATIONS, START_STATION, GAME_LEVELS } from './utils/gameData';
import type { StationData } from './utils/gameData';
import type { CellState } from './components/LogicalPuzzle';

export type GamePhase = 'MAP' | 'TRAVELING' | 'ARRIVED' | 'PUZZLE' | 'COMPLETED';

export interface TravelInfo {
  trainName: string;
  departureTime: string; // ISO String
  arrivalTime: string; // ISO String
  targetStation: StationData;
  stopovers: {
    station: StationData;
    arrival: string;
  }[];
}

interface GameState {
  isLoggedIn: boolean;
  currentStation: StationData;
  clueIndex: number;
  collectedClues: string[];
  levelIndex: number;
  puzzleGrid: Record<string, CellState>;
  phase: GamePhase;
  travelInfo: TravelInfo | null;
  visitedStations: string[];
  knownStations: Record<string, StationData>;
}

const STORAGE_KEY = 'shogito_train_game_state';

const defaultState: GameState = {
  isLoggedIn: false,
  currentStation: START_STATION,
  clueIndex: 0,
  collectedClues: [],
  levelIndex: 0,
  puzzleGrid: {},
  phase: 'MAP',
  travelInfo: null,
  visitedStations: [START_STATION.id],
  knownStations: STATIONS,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (code: string) => {
    if (code.trim().toUpperCase() === 'PAPA2026') {
      setState(s => ({ ...s, isLoggedIn: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(s => ({ ...s, isLoggedIn: false }));
  };

  const startTravel = (info: TravelInfo) => {
    setState(s => ({ ...s, phase: 'TRAVELING', travelInfo: info }));
  };

  const arriveAt = (target: StationData) => {
    setState(s => {
      if (!s.travelInfo) return s;
      
      const newVisited = s.visitedStations.includes(target.id) 
        ? s.visitedStations 
        : [...s.visitedStations, target.id];
        
      const updatedKnownStations = { ...s.knownStations };
      s.travelInfo.stopovers.forEach(stop => {
        if (!updatedKnownStations[stop.station.id]) {
          updatedKnownStations[stop.station.id] = stop.station;
        }
      });
      if (!updatedKnownStations[target.id]) {
        updatedKnownStations[target.id] = target;
      }

      return {
        ...s,
        phase: 'ARRIVED',
        currentStation: target,
        travelInfo: null,
        visitedStations: newVisited,
        knownStations: updatedKnownStations,
      };
    });
  };

  const collectClue = (clue: string) => {
    setState(s => ({
      ...s,
      clueIndex: s.clueIndex + 1,
      collectedClues: [...s.collectedClues, clue]
    }));
  };

  const updatePuzzleGrid = (grid: Record<string, CellState>) => {
    setState(s => ({ ...s, puzzleGrid: grid }));
  };

  const arrive = () => {
    if (state.travelInfo) {
      arriveAt(state.travelInfo.targetStation);
    }
  };

  const cancelTravel = () => {
    setState(s => ({ ...s, phase: 'MAP', travelInfo: null }));
  };

  const completePuzzle = () => {
    setState(s => {
      if (s.levelIndex < GAME_LEVELS.length - 1) {
        return {
          ...s,
          levelIndex: s.levelIndex + 1,
          clueIndex: 0,
          collectedClues: [],
          puzzleGrid: {},
          phase: 'MAP'
        };
      } else {
        return { ...s, phase: 'COMPLETED' };
      }
    });
  };

  const resetGame = () => {
    setState({ ...defaultState, isLoggedIn: true });
  };

  return {
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
    resetGame
  };
}
