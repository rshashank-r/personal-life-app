import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { colors, spacing, typography } from '../../core/theme';

export const EmptyState = ({ icon, title, message, customIcon }) => (
    <View style={styles.container}>
        {customIcon || <Inbox size={48} color={colors.textMuted} />}
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
    title: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.lg },
    message: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
