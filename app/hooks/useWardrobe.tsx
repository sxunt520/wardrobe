import { useState, useCallback, useEffect } from 'react';
import { ClothingItem } from '@/types/clothing';
import { getClothingItems, addClothingItem, updateClothingItem, deleteClothingItem } from '@/services/clothing';
import { useAuthStore } from '@/stores/authStore';

export const useWardrobe = () => {
  const { user } = useAuthStore();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWardrobe = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const items = await getClothingItems();
      setClothingItems(items);
    } catch (err) {
      setError('获取衣橱数据失败');
      console.error('获取衣橱数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = useCallback(async (item: Omit<ClothingItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('未登录');

    try {
      const newItem = await addClothingItem({
        ...item,
      });

      setClothingItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw new Error('添加衣物失败');
    }
  }, [user]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<ClothingItem>) => {
    if (!user) throw new Error('未登录');

    try {
      const updatedItem = await updateClothingItem(itemId, updates);
      
      setClothingItems(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      
      return updatedItem;
    } catch (err) {
      throw new Error('更新衣物失败');
    }
  }, [user]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!user) throw new Error('未登录');

    try {
      await deleteClothingItem(itemId);
      setClothingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      throw new Error('删除衣物失败');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWardrobe();
    }
  }, [user, fetchWardrobe]);

  return {
    clothingItems,
    loading,
    error,
    fetchWardrobe,
    addItem,
    updateItem,
    deleteItem,
  };
};
