import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../core/theme';

export const Header = ({ title, subtitle }) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
