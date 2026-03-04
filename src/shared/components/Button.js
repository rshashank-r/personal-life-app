import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../core/theme';

const variants = {
    primary: { bg: colors.accent, text: '#000' },
    secondary: { bg: colors.secondaryDim, text: colors.secondary },
    ghost: { bg: 'transparent', text: colors.textSecondary },
    danger: { bg: 'rgba(248,113,113,0.15)', text: colors.error },
};

export const Button = ({ title, onPress, variant = 'primary', disabled, loading, style, size }) => {
    const v = variants[variant] || variants.primary;
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.btn,
                { backgroundColor: v.bg },
                size === 'sm' && styles.sm,
                disabled && styles.disabled,
                style,
            ]}>
            {loading ? (
                <ActivityIndicator color={v.text} size="small" />
            ) : (
                <Text style={[styles.text, { color: v.text }, size === 'sm' && styles.smText]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md, alignItems: 'center' },
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    text: { ...typography.bodyBold, textAlign: 'center' },
    smText: { fontSize: 12 },
    disabled: { opacity: 0.4 },
});
