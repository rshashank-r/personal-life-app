import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../core/theme';

export const EmptyState = ({ icon, title, message }) => (
    <View style={styles.container}>
        <MaterialCommunityIcons name={icon || 'inbox-outline'} size={48} color={colors.textMuted} />
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
    title: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.lg },
    message: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
