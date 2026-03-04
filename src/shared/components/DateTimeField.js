import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../core/theme';
import { formatDate, formatDateTime } from '../utils';

const pad = (n) => String(n).padStart(2, '0');

const toDateOnlyString = (date) => (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
);

const toLocalDateTimeString = (date) => (
    `${toDateOnlyString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
);

const parseDateValue = (value, mode) => {
    if (!value) return new Date();
    if (mode === 'date') {
        const [y, m, d] = value.split('-').map(Number);
        if (!y || !m || !d) return new Date();
        return new Date(y, m - 1, d, 12, 0, 0, 0);
    }
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? new Date() : dt;
};

export const DateTimeField = ({ label, value, onChange, mode = 'date', placeholder }) => {
    const [open, setOpen] = useState(false);
    const [phase, setPhase] = useState('date');
    const [draftDate, setDraftDate] = useState(null);
    const pickerValue = useMemo(() => parseDateValue(value, mode), [value, mode]);
    const isAndroidDateTime = Platform.OS === 'android' && mode === 'datetime';
    const activePickerValue = isAndroidDateTime && phase === 'time' && draftDate ? draftDate : pickerValue;
    const displayValue = value
        ? (mode === 'date' ? formatDate(value) : formatDateTime(value))
        : (placeholder || (mode === 'date' ? 'Select date' : 'Select date & time'));

    const closePicker = () => {
        setOpen(false);
        setPhase('date');
        setDraftDate(null);
    };

    const handleChange = (event, selectedDate) => {
        if (event?.type === 'dismissed' || !selectedDate) {
            closePicker();
            return;
        }

        if (!isAndroidDateTime) {
            setOpen(false);
            onChange(mode === 'date' ? toDateOnlyString(selectedDate) : toLocalDateTimeString(selectedDate));
            return;
        }

        if (phase === 'date') {
            const next = new Date(draftDate || pickerValue);
            next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDraftDate(next);
            setPhase('time');
            return;
        }

        const next = new Date(draftDate || pickerValue);
        next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
        closePicker();
        onChange(toLocalDateTimeString(next));
    };

    const openPicker = () => {
        if (isAndroidDateTime) {
            setPhase('date');
            setDraftDate(pickerValue);
        }
        setOpen(true);
    };

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TouchableOpacity style={styles.field} activeOpacity={0.85} onPress={openPicker}>
                <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>{displayValue}</Text>
                <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {open ? (
                <DateTimePicker
                    key={isAndroidDateTime ? `android-${phase}` : mode}
                    value={activePickerValue}
                    mode={isAndroidDateTime ? phase : mode}
                    is24Hour={false}
                    display="default"
                    onChange={handleChange}
                />
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
    field: {
        minHeight: 48,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    value: { ...typography.body, color: colors.textPrimary, flex: 1 },
    placeholder: { color: colors.textMuted },
});
