import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../../core/theme';

export const Card = ({ children, style, onPress, glow }) => {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
        <Wrapper onPress={onPress} activeOpacity={0.7} style={[styles.card, glow && styles.glow, style]}>
            {children}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    glow: { borderColor: 'rgba(0, 212, 255, 0.15)' },
});
