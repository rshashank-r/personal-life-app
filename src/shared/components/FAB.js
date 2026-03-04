import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../core/theme';

export const FAB = ({ onPress, icon = 'plus' }) => (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
        <MaterialCommunityIcons name={icon} size={28} color="#000" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
        borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center',
        justifyContent: 'center', elevation: 8,
        shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    },
});
