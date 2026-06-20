import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getCaptcha, login as authLogin } from '@/services/auth';
import type { CaptchaInfo } from '@/types/user';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginScreen() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const router = useRouter();

  const refreshCaptcha = async () => {
    try {
      setCaptcha(await getCaptcha());
      setCode('');
    } catch {
      setCaptcha(null);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleLogin = async () => {
    if (!userName || !password) {
      setError('请填写用户名和密码');
      return;
    }
    if (captcha?.captchaEnabled && !code) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authLogin({
        userName,
        password,
        code: captcha?.captchaEnabled ? code : undefined,
        uuid: captcha?.captchaEnabled ? captcha.uuid : undefined,
      });
      await setUser(user);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请检查用户名和密码');
      await refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录您的衣橱管家账户</Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.form}>
          <Input
            label="用户名"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
            placeholder="请输入用户名"
          />

          {captcha?.captchaEnabled && (
            <View style={styles.captchaRow}>
              <View style={styles.captchaInput}>
                <Input
                  label="验证码"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="none"
                  placeholder="请输入验证码"
                />
              </View>
              <TouchableOpacity onPress={refreshCaptcha} style={styles.captchaImage}>
                {captcha.img ? <Image source={{ uri: captcha.img }} style={styles.captchaImageContent} /> : null}
              </TouchableOpacity>
            </View>
          )}

          <Input
            label="密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <Button
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupText}>还没有账户？注册</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  captchaInput: {
    flex: 1,
  },
  captchaImage: {
    width: 120,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    marginBottom: 1,
  },
  captchaImageContent: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  signupText: {
    color: '#4a6cf7',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});
