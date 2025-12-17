import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const AppInput = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, multiline, style, theme: propsTheme }) => {
  const { theme: contextTheme } = useTheme();
  const theme = propsTheme || contextTheme;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: theme.inputBg, 
            color: theme.text, 
            borderColor: theme.borderColor 
          },
          multiline && { height: 100, textAlignVertical: 'top' }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
});