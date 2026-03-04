import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header, Card, Button } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';

const FocusModeScreen = () => {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return undefined;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [running]);

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');

    return (
        <View style={styles.container}>
            <Header title="Focus Mode" subtitle="Pomodoro 25-minute session" />
            <Card style={styles.card}>
                <Text style={styles.timer}>{mm}:{ss}</Text>
                <View style={styles.row}>
                    <Button title={running ? 'Pause' : 'Start'} onPress={() => setRunning((v) => !v)} style={{ flex: 1 }} />
                    <Button title="Reset" variant="ghost" onPress={() => { setRunning(false); setSecondsLeft(25 * 60); }} style={{ flex: 1 }} />
                </View>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    card: { marginTop: spacing.xl, alignItems: 'center' },
    timer: { ...typography.h1, fontSize: 56, color: colors.accent, marginBottom: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.sm },
});

export default FocusModeScreen;
