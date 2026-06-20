import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LocationData } from '@/types/location';

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

      const position = Platform.OS === 'web'
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        : (await Location.getLastKnownPositionAsync({ maxAge: 1000 * 60 * 10, requiredAccuracy: 1000 }))
          || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
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
    } catch (err: any) {
      const detail = String(err?.message || '');
      setError(/denied|permission/i.test(detail)
        ? '位置权限被拒绝，请在浏览器或系统设置中开启'
        : '暂时无法获取位置，请检查定位服务和网络后重试');
      console.error('获取位置失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [permissionGranted, requestPermissions]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    permissionGranted,
    getLocation: getCurrentLocation,
    requestPermissions,
  };
};
