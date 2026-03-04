import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { Header, Card, Button } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_RADIUS = 120;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const FocusModeScreen = () => {
    const TOTAL_SECONDS = 25 * 60;
    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
    const [running, setRunning] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);

    const progress = useSharedValue(1); // 1 = full, 0 = empty

    useEffect(() => {
        let timer;
        if (running) {
            timer = setInterval(() => {
                setSecondsLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setRunning(false);
                        setSessionCount(s => s + 1);
                        progress.value = withTiming(0, { duration: 1000 });
                        return 0;
                    }
                    progress.value = withTiming(next / TOTAL_SECONDS, { duration: 1000, easing: Easing.linear });
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [running]);

    const handleReset = () => {
        setRunning(false);
        setSecondsLeft(TOTAL_SECONDS);
        progress.value = withTiming(1, { duration: 500 });
    };

    const toggleTimer = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(TOTAL_SECONDS);
            progress.value = 1;
        }
        setRunning(!running);
    };

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value)
    }));

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');

    return (
        <View style={styles.container}>
            <Header title="Focus Mode" />

            <View style={styles.content}>
                <View style={styles.sessionBadge}>
                    <Text style={styles.sessionText}>Sessions Completed: {sessionCount}</Text>
                </View>

                <View style={styles.timerContainer}>
                    <Svg width={CIRCLE_RADIUS * 2 + 40} height={CIRCLE_RADIUS * 2 + 40} style={styles.svg}>
                        {/* Background Circle */}
                        <Circle
                            cx={CIRCLE_RADIUS + 20}
                            cy={CIRCLE_RADIUS + 20}
                            r={CIRCLE_RADIUS}
                            stroke={colors.surface}
                            strokeWidth={20}
                            fill="none"
                        />
                        {/* Animated Progress Circle */}
                        <AnimatedCircle
                            cx={CIRCLE_RADIUS + 20}
                            cy={CIRCLE_RADIUS + 20}
                            r={CIRCLE_RADIUS}
                            stroke={colors.accent}
                            strokeWidth={20}
                            fill="none"
                            strokeDasharray={CIRCLE_CIRCUMFERENCE}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${CIRCLE_RADIUS + 20} ${CIRCLE_RADIUS + 20})`}
                        />
                    </Svg>
                    <View style={styles.timeDisplay}>
                        <Text style={styles.timeText}>{mm}:{ss}</Text>
                        <Text style={styles.timeLabel}>{running ? 'Focusing...' : 'Paused'}</Text>
                    </View>
                </View>

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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl
    },

    sessionBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginBottom: spacing.xxxl,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)'
    },
    sessionText: {
        ...typography.bodyBold,
        color: colors.secondary
    },

    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xxxl
    },
    svg: {
        position: 'absolute'
    },
    timeDisplay: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    timeText: {
        fontFamily: 'Inter',
        fontSize: 64,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 2
    },
    timeLabel: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.xs
    },

    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: spacing.xxl
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
    secondaryBtnSpacer: {
        width: 56,
        height: 56
    }
});

export default FocusModeScreen;
