import api, { normalizeMediaUrl, unwrapData } from './api';
import { isRemoteImageUrl, uploadImage } from './upload';
import { ClothingItem } from '@/types/clothing';

export type ClothingFilters = {
  category?: string;
  color?: string;
  season?: string;
  isFrequent?: boolean;
};

export const getClothingItems = async (filters: ClothingFilters = {}): Promise<ClothingItem[]> => {
  const response = await api.get('/app/wardrobe/clothing', {
    params: filters,
  });
  return unwrapData<ClothingItem[]>(response).map((item) => ({
    ...item,
    imageUrl: normalizeMediaUrl(item.imageUrl),
  }));
};

export const addClothingItem = async (data: Partial<ClothingItem>): Promise<ClothingItem> => {
  const imageUrl = data.imageUrl && !isRemoteImageUrl(data.imageUrl)
    ? (await uploadImage(data.imageUrl)).url
    : data.imageUrl || '';
  const response = await api.post('/app/wardrobe/clothing', {
    name: data.name || '未命名单品',
    category: data.category || '上衣',
    color: data.color || '',
    texture: (data as any).texture || '',
    brand: data.brand || '',
    season: (data as any).season || '四季',
    imageUrl,
    tags: (data as any).tags || [],
    isFavorite: Boolean((data as any).isFavorite),
    isFrequent: Boolean((data as any).isFrequent),
  });
  const item = unwrapData<ClothingItem>(response);
  return { ...item, imageUrl: normalizeMediaUrl(item.imageUrl) };
};

export const updateClothingItem = async (id: string, data: Partial<ClothingItem>): Promise<ClothingItem> => {
  const response = await api.patch(`/app/wardrobe/clothing/${id}`, data);
  const item = unwrapData<ClothingItem>(response);
  return { ...item, imageUrl: normalizeMediaUrl(item.imageUrl) };
};

export const deleteClothingItem = async (id: string): Promise<void> => {
  await api.delete(`/app/wardrobe/clothing/${id}`);
};

export const deleteClothing = async (id: string, _userId?: string): Promise<void> => {
  await deleteClothingItem(id);
};

export const updateClothing = async (item: ClothingItem): Promise<void> => {
  await updateClothingItem(item.id, item);
};

export const addClothing = addClothingItem;
