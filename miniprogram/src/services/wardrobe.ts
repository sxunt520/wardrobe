import Taro from '@tarojs/taro';
import { API_BASE_URL, getToken, normalizeMediaUrl, request } from './api';
import type { ClothingItem, ExploreFeed, OutfitRecommendation, UploadedFile } from '@/types';

export async function getExploreFeed() {
  return request<ExploreFeed>({
    url: '/app/wardrobe/explore',
    method: 'GET',
  });
}

export async function getClothingItems(category = '全部') {
  const data = await request<ClothingItem[] | { list: ClothingItem[] }>({
    url: '/app/wardrobe/clothing',
    method: 'GET',
    data: category === '全部' ? {} : { category },
  });
  const list = Array.isArray(data) ? data : data.list || [];
  return list.map((item) => ({ ...item, imageUrl: normalizeMediaUrl(item.imageUrl) }));
}

export async function uploadImage(filePath: string) {
  const token = getToken();
  const response = await Taro.uploadFile({
    url: `${API_BASE_URL}/common/upload`,
    filePath,
    name: 'file',
    header: token ? { Authorization: `Bearer ${token}` } : {},
  });
  let body: any = response.data;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  if (body?.code && body.code !== 200) {
    throw new Error(body.msg || body.message || '图片上传失败');
  }
  const data = body.data as UploadedFile;
  return { ...data, url: normalizeMediaUrl(data.url) };
}

export async function analyzeClothing(imageUrl: string, hint?: string) {
  return request<Partial<ClothingItem> & { confidence?: number; recognized?: boolean; errorMessage?: string }>({
    url: '/app/wardrobe/ai/analyze-clothing',
    method: 'POST',
    data: { imageUrl, hint },
  });
}

export async function createClothing(item: Partial<ClothingItem>) {
  const data = await request<ClothingItem>({
    url: '/app/wardrobe/clothing',
    method: 'POST',
    data: {
      name: item.name || '未命名单品',
      category: item.category || '上衣',
      color: item.color || '',
      texture: item.texture || '',
      brand: item.brand || '',
      season: item.season || '四季',
      imageUrl: item.imageUrl || '',
      tags: item.tags || [],
      isFavorite: Boolean(item.isFavorite),
      isFrequent: Boolean(item.isFrequent),
    },
  });
  return { ...data, imageUrl: normalizeMediaUrl(data.imageUrl) };
}

export async function deleteClothing(id: string) {
  return request<{ success: boolean }>({
    url: `/app/wardrobe/clothing/${id}`,
    method: 'DELETE',
  });
}

export async function generateOutfits(params: { scene?: string; weather?: string; temperature?: number; clothingIds?: string[] }) {
  const data = await request<OutfitRecommendation[]>({
    url: '/app/wardrobe/outfits/generate',
    method: 'POST',
    timeout: 90000,
    data: params,
  });
  return data.map((item) => ({ ...item, previewImageUrl: normalizeMediaUrl(item.previewImageUrl) }));
}

export async function getOutfitHistory() {
  const data = await request<OutfitRecommendation[] | { list: OutfitRecommendation[] }>({
    url: '/app/wardrobe/outfits/history',
    method: 'GET',
  });
  const list = Array.isArray(data) ? data : data.list || [];
  return list.map((item) => ({ ...item, previewImageUrl: normalizeMediaUrl(item.previewImageUrl) }));
}

export async function deleteOutfit(id: string) {
  return request<{ success: boolean }>({
    url: `/app/wardrobe/outfits/${id}`,
    method: 'DELETE',
  });
}
