import React from 'react';
import { View, Text, Modal as RNModal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../core/theme';

export const Modal = ({ visible, onClose, title, children }) => (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
            </View>
        </View>
    </RNModal>
);

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '80%' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.textMuted, alignSelf: 'center', marginBottom: spacing.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    title: { ...typography.h3, color: colors.textPrimary },
    close: { color: colors.textMuted, fontSize: 20, padding: spacing.sm },
});
