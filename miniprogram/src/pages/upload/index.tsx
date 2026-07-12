import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Button, Image, Input, Picker, Text, View } from '@tarojs/components';
import { getToken } from '@/services/api';
import { analyzeClothing, createClothing, uploadImage } from '@/services/wardrobe';
import type { ClothingItem } from '@/types';
import './index.scss';

const categories = ['上衣', '裤装', '裙装', '外套', '鞋包', '配饰'];
const seasons = ['四季', '春秋', '夏季', '冬季'];

export default function UploadPage() {
  const [localPath, setLocalPath] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [form, setForm] = useState<Partial<ClothingItem>>({ category: '上衣', season: '四季' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const ensureLogin = () => {
    if (getToken()) return true;
    Taro.navigateTo({ url: '/pages/login/index' });
    return false;
  };

  const chooseAndUpload = async () => {
    if (!ensureLogin()) return;
    try {
      setBusy(true);
      setStatus('选择图片中...');
      const result = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
      const path = result.tempFilePaths[0];
      setLocalPath(path);
      setUploadedUrl('');
      setStatus('图片上传腾讯云 COS 中...');
      const uploaded = await uploadImage(path);
      setUploadedUrl(uploaded.url);
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
      setStatus('上传成功，正在 AI 识别...');
      const analyzed = await analyzeClothing(uploaded.url);
      setForm((prev) => ({
        ...prev,
        ...analyzed,
        imageUrl: uploaded.url,
        category: analyzed.category || prev.category || '上衣',
        season: analyzed.season || prev.season || '四季',
      }));
      setStatus(`识别成功：${analyzed.name || '衣物'}`);
      Taro.showToast({ title: '识别成功', icon: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传识别失败';
      setStatus(message);
      Taro.showToast({ title: message, icon: 'none' });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!ensureLogin()) return;
    if (!form.imageUrl) {
      Taro.showToast({ title: '请先上传衣物图片', icon: 'none' });
      return;
    }
    try {
      setBusy(true);
      setStatus('正在保存衣物...');
      await createClothing(form);
      setStatus('保存成功');
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/wardrobe/index' }), 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      setStatus(message);
      Taro.showToast({ title: message, icon: 'none' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="page">
      <View className="upload-box" onClick={chooseAndUpload}>
        {localPath || uploadedUrl ? (
          <Image className="preview" src={uploadedUrl || localPath} mode="aspectFill" />
        ) : (
          <View className="placeholder">
            <Text className="placeholder-title">拍照或从相册选择</Text>
            <Text className="placeholder-desc">请上传清晰、完整、真实的单件衣物图片</Text>
          </View>
        )}
      </View>

      {uploadedUrl ? (
        <View className="cos-card">
          <Text className="field-label">腾讯云 COS 图片地址</Text>
          <Text className="cos-url">{uploadedUrl}</Text>
        </View>
      ) : null}

      <View className="status">{status || '上传后会自动识别类别、颜色、材质和季节。'}</View>

      <View className="card form-card">
        <View className="field">
          <Text className="field-label">名称</Text>
          <Input className="input" value={form.name || ''} placeholder="例如：蓝色牛津纺衬衫" onInput={(e) => setForm({ ...form, name: e.detail.value })} />
        </View>
        <View className="field">
          <Text className="field-label">类别</Text>
          <Picker mode="selector" range={categories} value={Math.max(categories.indexOf(form.category || '上衣'), 0)} onChange={(e) => setForm({ ...form, category: categories[Number(e.detail.value)] })}>
            <View className="picker-value row between">{form.category || '上衣'}<Text>›</Text></View>
          </Picker>
        </View>
        <View className="grid">
          <View className="field">
            <Text className="field-label">颜色</Text>
            <Input className="input" value={form.color || ''} placeholder="蓝色" onInput={(e) => setForm({ ...form, color: e.detail.value })} />
          </View>
          <View className="field">
            <Text className="field-label">季节</Text>
            <Picker mode="selector" range={seasons} value={Math.max(seasons.indexOf(form.season || '四季'), 0)} onChange={(e) => setForm({ ...form, season: seasons[Number(e.detail.value)] })}>
              <View className="picker-value row between">{form.season || '四季'}<Text>›</Text></View>
            </Picker>
          </View>
        </View>
        <View className="grid">
          <View className="field">
            <Text className="field-label">材质</Text>
            <Input className="input" value={form.texture || ''} placeholder="棉/羊毛" onInput={(e) => setForm({ ...form, texture: e.detail.value })} />
          </View>
          <View className="field">
            <Text className="field-label">品牌</Text>
            <Input className="input" value={form.brand || ''} placeholder="可选" onInput={(e) => setForm({ ...form, brand: e.detail.value })} />
          </View>
        </View>
        <Button className="btn save-btn" loading={busy} disabled={busy} onClick={save}>保存衣物</Button>
      </View>
    </View>
  );
}
