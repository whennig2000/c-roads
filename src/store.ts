import { useState, useEffect } from 'react';
import { STATIONS, START_STATION } from './utils/gameData';
import type { StationData } from './utils/gameData';

export type GamePhase = 'MAP' | 'TRAVELING' | 'ARRIVED' | 'PUZZLE' | 'COMPLETED';

export interface TravelInfo {
  trainName: string;
  departureTime: string; // ISO String
  arrivalTime: string; // ISO String
  targetStation: StationData;
}

interface GameState {
  isLoggedIn: boolean;
  currentStation: StationData;
  targetStationId: string;
  levelIndex: number;
  phase: GamePhase;
  travelInfo: TravelInfo | null;
  visitedStations: string[];
}

const STORAGE_KEY = 'shogito_train_game_state';

const defaultState: GameState = {
  isLoggedIn: false,
  currentStation: START_STATION,
  targetStationId: STATIONS.berlin.id,
  levelIndex: 0,
  phase: 'MAP',
  travelInfo: null,
  visitedStations: [START_STATION.id],
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

  const arrive = () => {
    setState(s => {
      if (!s.travelInfo) return s;
      const target = s.travelInfo.targetStation;
      const newVisited = s.visitedStations.includes(target.id) 
        ? s.visitedStations 
        : [...s.visitedStations, target.id];
      return {
        ...s,
        phase: 'ARRIVED',
        currentStation: target,
        travelInfo: null,
        visitedStations: newVisited,
      };
    });
  };

  const startPuzzle = () => {
    setState(s => ({ ...s, phase: 'PUZZLE' }));
  };

  const completePuzzle = (nextTargetId: string | null) => {
    if (nextTargetId) {
      setState(s => ({
        ...s,
        phase: 'MAP',
        levelIndex: s.levelIndex + 1,
        targetStationId: nextTargetId
      }));
    } else {
      setState(s => ({ ...s, phase: 'COMPLETED' }));
    }
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
    startPuzzle,
    completePuzzle,
    resetGame
  };
}
