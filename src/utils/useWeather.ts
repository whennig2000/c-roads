import { useState, useEffect } from 'react';
import axios from 'axios';

export interface WeatherData {
  isDay: boolean;
  weatherCode: number;
}

export function useWeather(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchWeather = async () => {
      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        if (mounted && res.data?.current_weather) {
          const isDay = res.data.current_weather.is_day === 1;
          const weatherCode = res.data.current_weather.weathercode;
          setWeather({ isDay, weatherCode });
        }
      } catch (err) {
        console.error("Weather API failed", err);
      }
    };

    fetchWeather();
    
    // Refresh every 10 minutes
    const timer = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [lat, lng]);

  return weather;
}
