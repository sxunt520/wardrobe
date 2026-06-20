import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { signup as authSignup } from '@/services/auth';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    if (!userName || !password || !nickname || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authSignup({ userName, password, nickname, email: email || undefined });
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请检查信息是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>创建账户</Text>
          <Text style={styles.subtitle}>开启智能衣橱管理之旅</Text>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.form}>
            <Input
              label="用户名"
              value={userName}
              onChangeText={setUserName}
              placeholder="用于登录，2-30位"
              autoCapitalize="none"
            />

            <Input
              label="昵称"
              value={nickname}
              onChangeText={setNickname}
              placeholder="例如：小明"
              autoCapitalize="words"
            />

            <Input
              label="邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="example@email.com"
            />

            <Input
              label="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="至少6位字符"
            />

            <Input
              label="确认密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="再次输入密码"
            />

            <Button
              onPress={handleSignup}
              disabled={loading}
              loading={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginText}>已有账户？登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContainer: {
    flexGrow: 1,
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
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginText: {
    color: '#4a6cf7',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});
