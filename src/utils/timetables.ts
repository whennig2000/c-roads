import { STATIONS } from './gameData';
import type { StationData } from './gameData';

// Kanten des Graphen (benachbarte Bahnhöfe)
const EDGES: [keyof typeof STATIONS, keyof typeof STATIONS][] = [
  ['hamburg', 'hannover'],
  ['hamburg', 'berlin'],
  ['hannover', 'kassel'],
  ['hannover', 'berlin'],
  ['berlin', 'halle'],
  ['berlin', 'leipzig'],
  ['halle', 'erfurt'],
  ['leipzig', 'erfurt'],
  ['leipzig', 'nuernberg'],
  ['kassel', 'frankfurt'],
  ['kassel', 'erfurt'],
  ['frankfurt', 'wuerzburg'],
  ['frankfurt', 'stuttgart'],
  ['frankfurt', 'koeln'],
  ['wuerzburg', 'nuernberg'],
  ['nuernberg', 'muenchen'],
  ['stuttgart', 'muenchen'],
];

// Helper: Distanz in km
function getDistance(coord1: [number, number], coord2: [number, number]) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// BFS zur Wegfindung
export function findPath(startId: string, endId: string): StationData[] | null {
  const stationMap = new Map(Object.values(STATIONS).map(s => [s.id, s]));
  
  if (!stationMap.has(startId) || !stationMap.has(endId)) return null;

  const adj = new Map<string, string[]>();
  Object.values(STATIONS).forEach(s => adj.set(s.id, []));

  EDGES.forEach(([k1, k2]) => {
    const s1 = STATIONS[k1].id;
    const s2 = STATIONS[k2].id;
    adj.get(s1)?.push(s2);
    adj.get(s2)?.push(s1);
  });

  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === endId) {
      return path.map(id => stationMap.get(id)!);
    }

    for (const neighbor of adj.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}

export function generateLocalFallbackJourneys(fromId: string, toId: string) {
  const path = findPath(fromId, toId);
  if (!path || path.length < 2) return [];

  const now = new Date();
  // Erster Zug in 2 Minuten
  const departure = new Date(now.getTime() + 2 * 60000);
  let currentTime = departure.getTime();

  const stopovers = [];

  for (let i = 0; i < path.length; i++) {
    if (i > 0) {
      const dist = getDistance(path[i - 1].coords, path[i].coords);
      // ICE Geschwindigkeit ca 150 km/h im Schnitt -> 2.5 km/Minute
      const travelTimeMs = Math.floor((dist / 2.5) * 60000);
      currentTime += travelTimeMs;
    }

    if (i > 0 && i < path.length - 1) {
      // Zwischenhalt
      stopovers.push({
        stop: { id: path[i].id, name: path[i].name, location: { latitude: path[i].coords[0], longitude: path[i].coords[1] } },
        arrival: new Date(currentTime).toISOString()
      });
      // 3 Min Aufenthalt
      currentTime += 3 * 60000; 
    }
  }

  const arrival = new Date(currentTime);

  return [{
    id: `local-ice-${Date.now()}`,
    legs: [{
      line: { name: "ICE 702 (Ersatzfahrplan)" },
      origin: { name: path[0].name },
      destination: { name: path[path.length - 1].name },
      departure: departure.toISOString(),
      arrival: arrival.toISOString(),
      stopovers
    }]
  }];
}
