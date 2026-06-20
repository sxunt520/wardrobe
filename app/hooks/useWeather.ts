import { useState, useEffect, useCallback } from 'react';
import type { LocationData } from '@/types/location';
import type { WeatherInfo } from '@/types/outfit';

const weatherLabels: Record<number, string> = {
  0: '晴',
  1: '大部晴朗',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '强毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '阵雨',
  81: '中阵雨',
  82: '强阵雨',
  95: '雷雨',
};

export const useWeather = (location?: LocationData | null) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const refresh = useCallback(() => setRequestId((value) => value + 1), []);

  useEffect(() => {
    if (!location) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          current: 'temperature_2m,apparent_temperature,weather_code',
          timezone: 'auto',
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('天气服务暂不可用');
        const data = await response.json();
        const current = data.current;
        if (!current || typeof current.temperature_2m !== 'number') throw new Error('天气数据格式异常');
        setWeather({
          temperature: Math.round(current.temperature_2m),
          condition: weatherLabels[current.weather_code] || '天气变化',
          icon: current.weather_code <= 1 ? 'sunny' : current.weather_code <= 3 ? 'partly-sunny' : 'rainy',
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : '获取天气失败');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [location, requestId]);

  return { weather, loading, error, refresh };
};
