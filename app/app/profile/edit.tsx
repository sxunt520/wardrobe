import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getWardrobeProfile, upsertWardrobeProfile } from '@/services/wardrobeApp';

const bodyShapes = ['梨形', '苹果形', '沙漏形', '直筒形', '倒三角'];
const skinTones = ['冷色调', '暖色调', '中性'];
const stylesList = ['极简', '通勤', '街头', '法式', '甜美', '运动'];

export default function EditProfileScreen() {
  const router = useRouter();
  const [form, setForm] = useState<any>({ nickname: '', height: '', weight: '', bodyShape: '', skinTone: '', stylePreferences: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getWardrobeProfile().then((profile) => setForm({
      ...profile,
      height: profile.height ? String(profile.height) : '',
      weight: profile.weight ? String(profile.weight) : '',
      stylePreferences: profile.stylePreferences || [],
    })).catch((loadError) => setError(loadError instanceof Error ? loadError.message : '档案加载失败'));
  }, []);

  const toggleStyle = (value: string) => {
    setForm((current: any) => ({
      ...current,
      stylePreferences: current.stylePreferences.includes(value)
        ? current.stylePreferences.filter((item: string) => item !== value)
        : [...current.stylePreferences, value],
    }));
  };

  const save = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await upsertWardrobeProfile({
        ...form,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      });
      setMessage('身材档案与风格偏好已保存');
      setTimeout(() => router.back(), 800);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>身材与风格偏好</Text>
      <Text style={styles.subtitle}>这些信息会影响 AI 的搭配建议。</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Input label="昵称" value={form.nickname || ''} onChangeText={(nickname) => setForm((current: any) => ({ ...current, nickname }))} />
      <Input label="身高（cm）" value={form.height || ''} keyboardType="numeric" onChangeText={(height) => setForm((current: any) => ({ ...current, height }))} />
      <Input label="体重（kg）" value={form.weight || ''} keyboardType="numeric" onChangeText={(weight) => setForm((current: any) => ({ ...current, weight }))} />

      <OptionGroup label="体型" values={bodyShapes} selected={[form.bodyShape]} onPress={(bodyShape) => setForm((current: any) => ({ ...current, bodyShape }))} />
      <OptionGroup label="肤色" values={skinTones} selected={[form.skinTone]} onPress={(skinTone) => setForm((current: any) => ({ ...current, skinTone }))} />
      <OptionGroup label="风格偏好" values={stylesList} selected={form.stylePreferences || []} onPress={toggleStyle} />

      <Button onPress={save} loading={loading} disabled={loading || Boolean(message)}>{message ? '保存成功' : '保存档案'}</Button>
    </ScrollView>
  );
}

function OptionGroup({ label, values, selected, onPress }: { label: string; values: string[]; selected: string[]; onPress: (value: string) => void }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {values.map((value) => {
          const active = selected.includes(value);
          return <TouchableOpacity key={value} style={[styles.option, active && styles.active]} onPress={() => onPress(value)}><Text style={active ? styles.activeText : styles.optionText}>{value}</Text></TouchableOpacity>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: '#191815', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#756A60', marginTop: 7, marginBottom: 20 },
  error: { color: '#9D2C22', backgroundColor: '#FDECEA', padding: 12, borderRadius: 8, marginBottom: 14 },
  success: { color: '#24653E', backgroundColor: '#E8F4EC', padding: 12, borderRadius: 8, marginBottom: 14, fontWeight: '700' },
  group: { marginBottom: 18 },
  label: { color: '#191815', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 7, backgroundColor: '#FFF8EF', borderWidth: 1, borderColor: '#D8C9BA' },
  active: { backgroundColor: '#191815', borderColor: '#191815' },
  optionText: { color: '#51483F' },
  activeText: { color: '#FFF8EF', fontWeight: '700' },
});
