import api, { normalizeMediaUrl, unwrapData } from './api';
import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';

export interface UploadedFile {
  fileName: string;
  newFileName: string;
  url: string;
}

export const isRemoteImageUrl = (uri?: string) => /^https?:\/\//i.test(uri || '');

type UploadImageSource = string | Pick<ImagePickerAsset, 'uri' | 'fileName' | 'mimeType' | 'file'>;

export const uploadImage = async (source: UploadImageSource): Promise<UploadedFile> => {
  const uri = typeof source === 'string' ? source : source.uri;
  if (isRemoteImageUrl(uri)) {
    return { fileName: '', newFileName: uri.split('/').pop() || '', url: uri };
  }
  const asset = typeof source === 'string' ? undefined : source;
  const fileName = asset?.fileName || uri.split('/').pop()?.split('?')[0] || `wardrobe-${Date.now()}.jpg`;
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeType = asset?.mimeType || (extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg');
  const form = new FormData();
  if (Platform.OS === 'web') {
    if (asset?.file) {
      form.append('file', asset.file, fileName);
    } else {
      const fileResponse = await fetch(uri);
      if (!fileResponse.ok) throw new Error('读取本地图片失败');
      form.append('file', await fileResponse.blob(), fileName);
    }
  } else {
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  const response = await api.post('/common/upload', form, {
    timeout: 60000,
  });
  if (response.data?.code !== 200) {
    throw new Error(response.data?.msg || '图片上传失败');
  }
  const uploaded = unwrapData<UploadedFile>(response);
  return { ...uploaded, url: normalizeMediaUrl(uploaded.url) };
};
