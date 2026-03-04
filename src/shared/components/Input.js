import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../core/theme';

export const Input = ({ label, value, onChangeText, placeholder, multiline, error, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                value={value} onChangeText={onChangeText} placeholder={placeholder}
                placeholderTextColor={colors.textMuted} multiline={multiline}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={[styles.input, focused && styles.focused, multiline && styles.multiline, error && styles.error]}
                {...props}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
    input: {
        backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md,
        color: colors.textPrimary, ...typography.body, borderWidth: 1, borderColor: colors.border,
    },
    focused: { borderColor: colors.accent },
    multiline: { minHeight: 100, textAlignVertical: 'top' },
    error: { borderColor: colors.error },
    errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});
