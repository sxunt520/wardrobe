import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { logout } from '@/services/auth';
import { getWardrobeProfile, getWardrobeReport } from '@/services/wardrobeApp';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [profile, setProfile] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  useFocusEffect(useCallback(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setReport(null);
      return;
    }
    Promise.all([getWardrobeProfile(), getWardrobeReport()])
      .then(([nextProfile, nextReport]) => {
        setProfile(nextProfile);
        setReport(nextReport);
      })
      .catch(() => null);
  }, [isAuthenticated]));

  const signOut = async () => {
    await logout();
    await clearAuth();
    router.replace('/(auth)/login');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.guestPage}>
          <View style={styles.guestIcon}><Ionicons name="person-outline" size={38} color="#A56D4D" /></View>
          <Text style={styles.guestTitle}>登录你的衣橱账户</Text>
          <Text style={styles.guestCopy}>同步衣物、搭配历史、身材档案和风格报告，在 Web、Android 与 iOS 间持续使用。</Text>
          <Pressable style={styles.guestButton} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="log-in-outline" size={19} color="#FFF8EF" />
            <Text style={styles.guestButtonText}>登录或注册</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)')}><Text style={styles.guestLink}>返回首页继续看看</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>STYLE PROFILE</Text>
        <Text style={styles.title}>我的</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.nickname || user?.nickName || '衣').slice(0, 1)}</Text></View>
          <View style={styles.identityText}>
            <Text style={styles.name}>{profile?.nickname || user?.nickName || user?.userName}</Text>
            <Text style={styles.account}>@{user?.userName} · 已录入 {report?.totalItems || 0} 件衣物</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>身材档案</Text>
          <View style={styles.grid}>
            <Info label="身高" value={profile?.height ? `${profile.height} cm` : '未填写'} />
            <Info label="体型" value={profile?.bodyShape || '未填写'} />
            <Info label="肤色" value={profile?.skinTone || '未填写'} />
            <Info label="风格" value={(profile?.stylePreferences || []).slice(0, 2).join('、') || '未填写'} />
          </View>
          <Pressable style={styles.editProfile} onPress={() => router.push('/profile/edit')}>
            <Ionicons name="create-outline" size={18} color="#191815" />
            <Text style={styles.editProfileText}>编辑身材与风格偏好</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>衣橱报告</Text>
          <InfoRow icon="shirt-outline" label="衣物总数" value={`${report?.totalItems || 0} 件`} />
          <InfoRow icon="repeat-outline" label="常穿单品" value={`${report?.frequentItems || 0} 件`} />
          <InfoRow icon="heart-outline" label="收藏单品" value={`${report?.favoriteItems || 0} 件`} />
          <InfoRow icon="bag-add-outline" label="建议补充" value={(report?.missingItems || []).join('、') || '暂无'} />
        </View>

        <Text style={styles.functionTitle}>功能中心</Text>
        <Feature icon="sparkles-outline" label="场景搭配生成" onPress={() => router.push('/outfits/generator')} />
        <Feature icon="time-outline" label="搭配历史与收藏" onPress={() => router.push('/outfits/history')} />
        <Feature icon="compass-outline" label="每日挑战与穿搭灵感" onPress={() => router.push('/(tabs)/explore')} />
        <Feature icon="body-outline" label="真人试穿历史" onPress={() => router.push('/outfits/try-on-history')} />
        <Feature icon="people-outline" label="社区投稿" status="开发中" />
        <Feature icon="diamond-outline" label="会员与高级报告" status="开发中" />

        <Pressable style={styles.logout} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#B42318" />
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.row}><Ionicons name={icon} size={20} color="#A56D4D" /><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

function Feature({ icon, label, onPress, status }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; status?: string }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={21} color={onPress ? '#A56D4D' : '#94877B'} />
      <Text style={[styles.menuText, !onPress && styles.disabledText]}>{label}</Text>
      {status ? <Text style={styles.status}>{status}</Text> : <Ionicons name="chevron-forward" size={19} color="#94877B" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { color: '#8B7969', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '900', color: '#191815', marginBottom: 18 },
  identity: { backgroundColor: '#191815', borderRadius: 8, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 23, fontWeight: '900', color: '#191815' },
  identityText: { flex: 1 },
  name: { color: '#FFF8EF', fontSize: 20, fontWeight: '900' },
  account: { color: 'rgba(255,248,239,0.65)', marginTop: 5 },
  section: { backgroundColor: '#FFF8EF', borderRadius: 8, padding: 17, marginTop: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#191815', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  editProfile: { minHeight: 44, marginTop: 12, borderRadius: 7, backgroundColor: '#F2E8DC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  editProfileText: { color: '#191815', fontWeight: '800' },
  info: { width: '48%', backgroundColor: '#F2E8DC', padding: 12, borderRadius: 7 },
  infoLabel: { color: '#8B7969', fontSize: 12 },
  infoValue: { color: '#191815', fontWeight: '800', marginTop: 5 },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DED2C6' },
  rowLabel: { flex: 1, color: '#51483F' },
  rowValue: { color: '#191815', fontWeight: '700', maxWidth: '48%', textAlign: 'right' },
  menuItem: { marginTop: 16, backgroundColor: '#FFF8EF', minHeight: 58, borderRadius: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  functionTitle: { fontSize: 20, fontWeight: '900', color: '#191815', marginTop: 24, marginBottom: -4 },
  menuText: { flex: 1, fontWeight: '800', color: '#191815' },
  disabledText: { color: '#756A60' },
  status: { color: '#8B5A3C', backgroundColor: '#EED8C6', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 5, fontSize: 11, fontWeight: '800' },
  logout: { marginTop: 16, minHeight: 52, borderRadius: 8, borderWidth: 1, borderColor: '#E3B7B2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: '#B42318', fontWeight: '800' },
  guestPage: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  guestIcon: { width: 76, height: 76, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  guestTitle: { color: '#191815', fontSize: 25, fontWeight: '900', marginTop: 22 },
  guestCopy: { color: '#756A60', lineHeight: 22, textAlign: 'center', marginTop: 12, maxWidth: 330 },
  guestButton: { width: '100%', maxWidth: 330, minHeight: 50, borderRadius: 8, backgroundColor: '#191815', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  guestButtonText: { color: '#FFF8EF', fontWeight: '800' },
  guestLink: { color: '#A56D4D', fontWeight: '800', marginTop: 18 },
});
