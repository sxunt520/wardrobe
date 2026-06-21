import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LocationData } from '@/types/location';

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const getNetworkLocation = async (): Promise<LocationData | null> => {
  try {
    const response = await withTimeout(fetch('https://ipwho.is/'), 8000);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.success || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      return null;
    }
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || data.region || '',
      country: data.country || '',
      postalCode: data.postal || '',
      street: '',
    };
  } catch {
    return null;
  }
};

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const current = await Location.getForegroundPermissionsAsync();
      const { status } = current.status === 'granted'
        ? current
        : await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') setError('位置权限未开启，请允许定位后重试');
      return status === 'granted';
    } catch {
      setError('无法请求位置权限，请检查浏览器或系统设置');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (permissionGranted !== true) {
        const granted = await requestPermissions();
        if (!granted) {
          return null;
        }
      }

      if (Platform.OS !== 'web' && !(await Location.hasServicesEnabledAsync())) {
        setError('系统定位服务未开启，请开启后重试');
        return null;
      }

      const cachedPosition = Platform.OS === 'web'
        ? null
        : await Location.getLastKnownPositionAsync({
          maxAge: 1000 * 60 * 60 * 24,
          requiredAccuracy: 5000,
        });
      const position = cachedPosition || await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.Low,
        }),
        12000,
      );
      const { latitude, longitude } = position.coords;

      // Web 已不支持 Expo 反向地理编码，但经纬度仍可直接用于天气。
      const currentLocation: LocationData = {
        latitude,
        longitude,
        city: '',
        country: '',
        postalCode: '',
        street: '',
      };
      setLocation(currentLocation);

      if (Platform.OS !== 'web') {
        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (address) {
            const located = {
              ...currentLocation,
              city: address.city || address.region || '',
              country: address.country || '',
              postalCode: address.postalCode || '',
              street: address.street || '',
            };
            setLocation(located);
            return located;
          }
        } catch {
          // 城市名称解析失败不应阻断天气查询。
        }
      }
      return currentLocation;
    } catch (err: unknown) {
      const detail = String((err as Error)?.message || '');
      if (!/denied|permission/i.test(detail)) {
        const networkLocation = await getNetworkLocation();
        if (networkLocation) {
          setLocation(networkLocation);
          setError(null);
          return networkLocation;
        }
      }
      setError(/denied|permission/i.test(detail)
        ? '位置权限被拒绝，请在浏览器或系统设置中开启'
        : '暂时无法获取位置，点击可重新获取');
      return null;
    } finally {
      setLoading(false);
    }
  }, [permissionGranted, requestPermissions]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    loading,
    error,
    permissionGranted,
    getLocation: getCurrentLocation,
    requestPermissions,
  };
};
