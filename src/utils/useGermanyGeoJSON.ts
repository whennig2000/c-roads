import { useState, useEffect } from 'react';
import axios from 'axios';

export function useGermanyGeoJSON() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Lade eine sehr einfache (niedrige Auflösung) GeoJSON-Datei der deutschen Bundesländer
    axios.get('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json')
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  return data;
}
