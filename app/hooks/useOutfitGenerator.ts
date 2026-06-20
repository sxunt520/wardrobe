import { useState } from 'react';
import { generateOutfits as generateOutfitsApi } from '@/services/outfit';

export const useOutfitGenerator = () => {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateOutfits = async (params?: any) => {
    setLoading(true);
    try {
      const result = await generateOutfitsApi({
        scene: params?.scene || '通勤',
        weather: params?.weather || '多云',
        temperature: params?.temperature || 23,
      });
      setOutfits(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { generateOutfits, loading, outfits };
};
