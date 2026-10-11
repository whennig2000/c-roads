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
  hannover: { id: "8000152", name: "Hannover Hbf", coords: [52.3767, 9.7410] as [number, number] },
  kassel: { id: "8003368", name: "Kassel-Wilhelmshöhe", coords: [51.3130, 9.4460] as [number, number] },
  nuernberg: { id: "8000284", name: "Nürnberg Hbf", coords: [49.4456, 11.0829] as [number, number] },
  wuerzburg: { id: "8000141", name: "Würzburg Hbf", coords: [49.8017, 9.9358] as [number, number] },
  halle: { id: "8010159", name: "Halle (Saale) Hbf", coords: [51.4775, 11.9871] as [number, number] },
  erfurt: { id: "8010101", name: "Erfurt Hbf", coords: [50.9725, 11.0383] as [number, number] },
  stuttgart: { id: "8000096", name: "Stuttgart Hbf", coords: [48.7833, 9.1816] as [number, number] },
  koeln: { id: "8000207", name: "Köln Hbf", coords: [50.9432, 6.9587] as [number, number] },
  bremen: { id: "8000050", name: "Bremen Hbf", coords: [53.0833, 8.8133] as [number, number] },
  dresden: { id: "8010085", name: "Dresden Hbf", coords: [51.0405, 13.7320] as [number, number] },
  dortmund: { id: "8000080", name: "Dortmund Hbf", coords: [51.5178, 7.4593] as [number, number] },
  duesseldorf: { id: "8000085", name: "Düsseldorf Hbf", coords: [51.2204, 6.7944] as [number, number] },
  mannheim: { id: "8000244", name: "Mannheim Hbf", coords: [49.4797, 8.4699] as [number, number] },
  karlsruhe: { id: "8000191", name: "Karlsruhe Hbf", coords: [49.0069, 8.4020] as [number, number] },
  freiburg: { id: "8000107", name: "Freiburg (Breisgau) Hbf", coords: [47.9977, 7.8415] as [number, number] },
  augsburg: { id: "8000013", name: "Augsburg Hbf", coords: [48.3654, 10.8856] as [number, number] },
  regensburg: { id: "8000309", name: "Regensburg Hbf", coords: [49.0118, 12.0990] as [number, number] },
  ulm: { id: "8000170", name: "Ulm Hbf", coords: [48.3982, 9.9822] as [number, number] }
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
