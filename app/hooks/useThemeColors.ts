import { useColorScheme } from 'react-native';

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return {
    tint: scheme === 'dark' ? '#fff' : '#000',
    tabIconDefault: scheme === 'dark' ? '#888' : '#aaa',
    background: scheme === 'dark' ? '#000' : '#fff',
    text: scheme === 'dark' ? '#fff' : '#000',
  };
};
