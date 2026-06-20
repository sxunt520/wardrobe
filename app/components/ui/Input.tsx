import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  icon?: string;
  onIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  icon,
  onIconPress 
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.errorBorder
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {icon && (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={onIconPress}
            activeOpacity={0.7}
          >
            <LucideIcon 
              name={icon} 
              color={colors.tint}
              size={20} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  focused: {
    borderColor: '#4a6cf7',
    shadowColor: '#4a6cf7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBorder: {
    borderColor: '#ff4d4f',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1a1a1a',
  },
  iconContainer: {
    padding: 8,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});
