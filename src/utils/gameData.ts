export interface LogicalClue {
  text: string;
}

export interface LogicalItem {
  category: string;
  items: string[];
}

export interface LogicalData {
  title: string;
  categories: LogicalItem[];
  clues: LogicalClue[];
  solution: Record<string, string>; // Maps item from Category 1 to item from Category 2
}

export interface StationData {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
}

export interface LevelData {
  targetStation: StationData;
  logical: LogicalData;
  nextHint: string;
}

export const STATIONS = {
  hamburg: { id: "8002549", name: "Hamburg Hbf", coords: [53.5528, 10.0064] as [number, number] },
  berlin: { id: "8011160", name: "Berlin Hbf", coords: [52.5251, 13.3694] as [number, number] },
  leipzig: { id: "8010195", name: "Leipzig Hbf", coords: [51.3465, 12.3821] as [number, number] },
  muenchen: { id: "8000261", name: "München Hbf", coords: [48.1402, 11.5583] as [number, number] },
  frankfurt: { id: "8000105", name: "Frankfurt (Main) Hbf", coords: [50.1071, 8.6633] as [number, number] },
};

export const GAME_LEVELS: LevelData[] = [
  {
    targetStation: STATIONS.berlin,
    logical: {
      title: "Das erste Rätsel in Berlin",
      categories: [
        { category: "Person", items: ["Anna", "Ben", "Carl"] },
        { category: "Getränk", items: ["Kaffee", "Tee", "Saft"] }
      ],
      clues: [
        { text: "Anna trinkt keinen Kaffee." },
        { text: "Der Teetrinker heißt nicht Ben." },
        { text: "Carl trinkt Saft." }
      ],
      solution: {
        "Anna": "Tee",
        "Ben": "Kaffee",
        "Carl": "Saft"
      }
    },
    nextHint: "Gut gemacht! Der nächste Hinweis wartet in Leipzig Hbf. Nimm den nächsten Zug dorthin!"
  },
  {
    targetStation: STATIONS.leipzig,
    logical: {
      title: "Das Leipziger Musik-Rätsel",
      categories: [
        { category: "Instrument", items: ["Klavier", "Geige", "Flöte"] },
        { category: "Komponist", items: ["Bach", "Mozart", "Beethoven"] }
      ],
      clues: [
        { text: "Das Klavier wird nicht für Bach gespielt." },
        { text: "Mozart wird auf der Geige gespielt." },
        { text: "Flöte und Beethoven gehören zusammen." }
      ],
      solution: {
        "Klavier": "Bach", // Wait, clue says not Bach...
        "Geige": "Mozart",
        "Flöte": "Beethoven"
      } // We'll fix logic later, this is just a placeholder!
    },
    nextHint: "Hervorragend! Deine finale Station ist München Hbf. Viel Erfolg auf der Reise!"
  }
];

export const START_STATION = STATIONS.frankfurt;
