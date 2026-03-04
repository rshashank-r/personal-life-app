import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../core/theme';

export const Badge = ({ label, color, style }) => (
    <View style={[styles.badge, color && { backgroundColor: `${color}20` }, style]}>
        <Text style={[styles.badgeText, color && { color }]}>{label}</Text>
    </View>
);

export const PriorityBadge = ({ priority }) => {
    const map = { high: colors.priorityHigh, medium: colors.priorityMedium, low: colors.priorityLow };
    return <Badge label={priority} color={map[priority]} />;
};

export const FilterChips = ({ options, selected, onSelect }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map(opt => (
            <TouchableOpacity key={String(opt.value)} onPress={() => onSelect(opt.value)}
                style={[styles.chip, selected === opt.value && styles.chipActive]}>
                <Text style={[styles.chipText, selected === opt.value && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
);

export const ConfirmDelete = ({ onDelete, label = 'Delete' }) => {
    const { Alert } = require('react-native');
    return (
        <TouchableOpacity onPress={() => Alert.alert('Confirm', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: onDelete }])}>
            <Text style={styles.deleteText}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, backgroundColor: colors.accentDim, alignSelf: 'flex-start' },
    badgeText: { ...typography.caption, color: colors.accent, fontWeight: '600' },
    chips: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
    chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
    chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: colors.accent },
    deleteText: { ...typography.body, color: colors.error },
});
