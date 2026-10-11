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
  ['hamburg', 'bremen'],
  ['bremen', 'dortmund'],
  ['hannover', 'dortmund'],
  ['dortmund', 'duesseldorf'],
  ['duesseldorf', 'koeln'],
  ['leipzig', 'dresden'],
  ['berlin', 'dresden'],
  ['frankfurt', 'mannheim'],
  ['stuttgart', 'mannheim'],
  ['karlsruhe', 'mannheim'],
  ['karlsruhe', 'stuttgart'],
  ['karlsruhe', 'freiburg'],
  ['muenchen', 'augsburg'],
  ['ulm', 'augsburg'],
  ['ulm', 'stuttgart'],
  ['nuernberg', 'augsburg'],
  ['nuernberg', 'regensburg'],
  ['muenchen', 'regensburg']
];

const ICE_LINES = [
  { name: 'ICE 11', route: ['berlin', 'leipzig', 'erfurt', 'frankfurt', 'mannheim', 'stuttgart', 'ulm', 'augsburg', 'muenchen'] },
  { name: 'ICE 18', route: ['hamburg', 'berlin', 'halle', 'erfurt', 'nuernberg', 'muenchen'] },
  { name: 'ICE 25', route: ['bremen', 'hannover', 'kassel', 'wuerzburg', 'nuernberg', 'muenchen'] },
  { name: 'ICE 42', route: ['dortmund', 'duesseldorf', 'koeln', 'frankfurt', 'mannheim', 'stuttgart', 'muenchen'] },
  { name: 'ICE 50', route: ['dresden', 'leipzig', 'erfurt', 'frankfurt'] },
  { name: 'ICE 10', route: ['koeln', 'duesseldorf', 'dortmund', 'hannover', 'berlin'] },
  { name: 'ICE 20', route: ['hamburg', 'hannover', 'kassel', 'frankfurt', 'mannheim', 'karlsruhe', 'freiburg'] },
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

  // Find a realistic ICE name
  const pathIds = path.map(p => {
    // Find the station key matching the id
    const entry = Object.entries(STATIONS).find(([_, s]) => s.id === p.id);
    return entry ? entry[0] : '';
  });

  let bestIce = "ICE 805 (Ersatz)";
  for (const line of ICE_LINES) {
    // Check if path is a subset of the line route (in either direction)
    const lineRoute = line.route;
    
    // Simple check: does the line contain both start and end?
    if (lineRoute.includes(pathIds[0]) && lineRoute.includes(pathIds[pathIds.length - 1])) {
      bestIce = line.name;
      break;
    }
  }

  return [{
    id: `local-ice-${Date.now()}`,
    legs: [{
      line: { name: bestIce },
      origin: { name: path[0].name },
      destination: { name: path[path.length - 1].name },
      departure: departure.toISOString(),
      arrival: arrival.toISOString(),
      stopovers
    }]
  }];
}
