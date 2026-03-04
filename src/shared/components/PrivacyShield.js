import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../core/theme';
import useProfileStore from '../../core/store/useProfileStore';
import { Button } from './Button';

export const PrivacyShield = ({ children }) => {
    const { settings, loading } = useProfileStore();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Convert string 'true' back to boolean from DB
    const isPrivacyEnabled = settings?.privacy_mode === 'true';

    const authenticate = useCallback(async () => {
        if (!isPrivacyEnabled || isAuthenticating) return;

        setIsAuthenticating(true);
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                // If device doesn't support it or user removed PIN, fallback to unlock 
                setIsUnlocked(true);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Personal Life App',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
                cancelLabel: 'Cancel'
            });

            if (result.success) {
                setIsUnlocked(true);
            } else {
                setIsUnlocked(false);
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            setIsUnlocked(false);
        } finally {
            setIsAuthenticating(false);
        }
    }, [isPrivacyEnabled, isAuthenticating]);

    useEffect(() => {
        if (!loading) {
            if (isPrivacyEnabled && !isUnlocked) {
                authenticate();
            } else if (!isPrivacyEnabled) {
                setIsUnlocked(true);
            }
        }
    }, [isPrivacyEnabled, loading, authenticate, isUnlocked]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                if (isPrivacyEnabled) {
                    setIsUnlocked(false);
                }
            } else if (nextAppState === 'active') {
                if (isPrivacyEnabled && !isUnlocked) {
                    authenticate();
                }
            }
        });

        return () => subscription.remove();
    }, [isPrivacyEnabled, isUnlocked, authenticate]);

    // Show nothing while DB is loading
    if (loading) return null;

    // Show App if unlocked or privacy disabled
    if (isUnlocked || !isPrivacyEnabled) {
        return children;
    }

    // Show Lock Screen
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={64} color={colors.accent} />
                </View>
                <Text style={styles.title}>App Locked</Text>
                <Text style={styles.subtitle}>Privacy Mode is enabled.</Text>
            </View>

            <View style={styles.bottomContainer}>
                <Button
                    title="Unlock App"
                    leftIcon="face-recognition"
                    onPress={authenticate}
                    disabled={isAuthenticating}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${colors.accent}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    bottomContainer: {
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
    }
});
