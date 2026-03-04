import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react-native';
import { Header } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_RADIUS = 110;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const PRESET_DURATIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90];

const FocusModeScreen = () => {
    const [durationMinutes, setDurationMinutes] = useState(25);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const totalSeconds = durationMinutes * 60;
    const progress = useSharedValue(1);

    useEffect(() => {
        let timer;
        if (running) {
            timer = setInterval(() => {
                setSecondsLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setRunning(false);
                        setSessionCount(s => s + 1);
                        setHasStarted(false);
                        progress.value = withTiming(0, { duration: 1000 });
                        return 0;
                    }
                    progress.value = withTiming(next / totalSeconds, { duration: 1000, easing: Easing.linear });
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [running, totalSeconds]);

    const handleReset = () => {
        setRunning(false);
        setHasStarted(false);
        setSecondsLeft(durationMinutes * 60);
        progress.value = withTiming(1, { duration: 500 });
    };

    const toggleTimer = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(durationMinutes * 60);
            progress.value = 1;
        }
        setHasStarted(true);
        setRunning(!running);
    };

    const adjustDuration = (delta) => {
        if (running || hasStarted) return;
        const newVal = Math.max(1, Math.min(120, durationMinutes + delta));
        setDurationMinutes(newVal);
        setSecondsLeft(newVal * 60);
        progress.value = 1;
    };

    const selectPreset = (mins) => {
        if (running || hasStarted) return;
        setDurationMinutes(mins);
        setSecondsLeft(mins * 60);
        progress.value = 1;
    };

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value)
    }));

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');

    const svgSize = CIRCLE_RADIUS * 2 + 40;

    return (
        <View style={styles.container}>
            <Header title="Focus Mode" back />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sessionBadge}>
                    <Text style={styles.sessionText}>Sessions Completed: {sessionCount}</Text>
                </View>

                {/* Timer Circle */}
                <View style={[styles.timerContainer, { width: svgSize, height: svgSize }]}>
                    <Svg width={svgSize} height={svgSize}>
                        <Circle
                            cx={CIRCLE_RADIUS + 20}
                            cy={CIRCLE_RADIUS + 20}
                            r={CIRCLE_RADIUS}
                            stroke={colors.surface}
                            strokeWidth={16}
                            fill="none"
                        />
                        <AnimatedCircle
                            cx={CIRCLE_RADIUS + 20}
                            cy={CIRCLE_RADIUS + 20}
                            r={CIRCLE_RADIUS}
                            stroke={colors.accent}
                            strokeWidth={16}
                            fill="none"
                            strokeDasharray={CIRCLE_CIRCUMFERENCE}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${CIRCLE_RADIUS + 20} ${CIRCLE_RADIUS + 20})`}
                        />
                    </Svg>
                    <View style={styles.timeDisplay}>
                        <Text style={styles.timeText}>{mm}:{ss}</Text>
                        <Text style={styles.timeLabel}>
                            {running ? 'Focusing...' : secondsLeft === 0 ? 'Done!' : hasStarted ? 'Paused' : 'Ready'}
                        </Text>
                    </View>
                </View>

                {/* Duration adjuster — only when not running */}
                {!hasStarted && (
                    <View style={styles.durationSection}>
                        <Text style={styles.durationLabel}>Duration</Text>
                        <View style={styles.durationAdjuster}>
                            <TouchableOpacity onPress={() => adjustDuration(-5)} style={styles.adjustBtn}>
                                <ChevronDown size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={styles.durationValue}>{durationMinutes} min</Text>
                            <TouchableOpacity onPress={() => adjustDuration(5)} style={styles.adjustBtn}>
                                <ChevronUp size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.presetRow}>
                            {PRESET_DURATIONS.map(mins => (
                                <TouchableOpacity
                                    key={mins}
                                    onPress={() => selectPreset(mins)}
                                    style={[styles.presetChip, durationMinutes === mins && styles.presetChipActive]}
                                >
                                    <Text style={[styles.presetText, durationMinutes === mins && styles.presetTextActive]}>
                                        {mins}m
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Controls */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={handleReset} style={styles.secondaryBtn}>
                        <RotateCcw size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleTimer} style={styles.playPauseBtn}>
                        {running ? (
                            <Pause size={32} color={colors.background} fill={colors.background} />
                        ) : (
                            <Play size={32} color={colors.background} fill={colors.background} style={{ marginLeft: 4 }} />
                        )}
                    </TouchableOpacity>

                    <View style={styles.secondaryBtnSpacer} />
                </View>

                {/* Tips */}
                <View style={styles.tipBox}>
                    <Text style={styles.tipTitle}>Focus Tips</Text>
                    <Text style={styles.tipText}>• Put your phone on Do Not Disturb</Text>
                    <Text style={styles.tipText}>• Close all unnecessary apps</Text>
                    <Text style={styles.tipText}>• Take a 5-min break after each session</Text>
                    <Text style={styles.tipText}>• After 4 sessions, take a 15-30 min break</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
        paddingTop: spacing.lg,
    },

    sessionBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)'
    },
    sessionText: { ...typography.bodyBold, color: colors.secondary },

    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    timeDisplay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 56,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 2
    },
    timeLabel: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.xs
    },

    // Duration selector
    durationSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        width: '100%',
    },
    durationLabel: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    durationAdjuster: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    adjustBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    durationValue: {
        ...typography.h2,
        color: colors.accent,
        minWidth: 80,
        textAlign: 'center',
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    presetChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    presetChipActive: {
        backgroundColor: colors.accentDim,
        borderColor: colors.accent,
    },
    presetText: {
        ...typography.caption,
        color: colors.textMuted,
        fontWeight: '600',
    },
    presetTextActive: {
        color: colors.accent,
    },

    // Controls
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: spacing.xxl,
        marginBottom: spacing.xxl,
    },
    playPauseBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8
    },
    secondaryBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border
    },
    secondaryBtnSpacer: { width: 56, height: 56 },

    // Tips
    tipBox: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    tipTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },
    tipText: { ...typography.caption, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});

export default FocusModeScreen;
