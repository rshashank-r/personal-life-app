import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, NativeModules } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import { useFocusEffect } from '@react-navigation/native';

// Safely check if the native module exists
const UsageStatsModule = NativeModules.UsageStatsManager || null;

let checkForPermission, showUsageAccessSettings, queryAndAggregateUsageStats;

try {
    const lib = require('@brighthustle/react-native-usage-stats-manager');
    checkForPermission = lib.checkForPermission;
    showUsageAccessSettings = lib.showUsageAccessSettings;
    queryAndAggregateUsageStats = lib.queryAndAggregateUsageStats;
} catch (e) {
    // Module not available — functions remain undefined
    console.warn('[ScreenTime] Native module not available:', e.message);
}

// Fallback friendly names for common packages
const APP_NAMES = {
    'com.whatsapp': 'WhatsApp',
    'com.instagram.android': 'Instagram',
    'com.google.android.youtube': 'YouTube',
    'com.zhiliaoapp.musically': 'TikTok',
    'com.twitter.android': 'X (Twitter)',
    'com.facebook.katana': 'Facebook',
    'com.snapchat.android': 'Snapchat',
    'com.android.chrome': 'Chrome',
    'com.google.android.googlequicksearchbox': 'Google',
    'com.netflix.mediaclient': 'Netflix',
    'com.spotify.music': 'Spotify',
    'com.reddit.frontpage': 'Reddit',
    'com.discord': 'Discord',
    'com.google.android.apps.messaging': 'Messages',
    'com.google.android.gm': 'Gmail',
    'com.google.android.apps.maps': 'Maps',
    'com.amazon.mShop.android.shopping': 'Amazon',
    'com.linkedin.android': 'LinkedIn',
    'org.telegram.messenger': 'Telegram',
};

const formatTime = (ms) => {
    if (!ms || ms <= 0) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const getTotalTime = (stats) => {
    if (!stats || stats.length === 0) return '0m';
    const total = stats.reduce((sum, s) => sum + (s.totalTimeInForeground || 0), 0);
    return formatTime(total);
};

const getFriendlyName = (pkg) => {
    if (!pkg) return 'Unknown';
    return APP_NAMES[pkg] || pkg.split('.').pop() || pkg;
};

const ScreenTimeTracker = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const [moduleAvailable, setModuleAvailable] = useState(true);

    const checkPermissionAndLoad = async () => {
        if (Platform.OS !== 'android') return;

        // Check if the native module is linked
        if (!UsageStatsModule || !checkForPermission) {
            setModuleAvailable(false);
            setError('Screen time module is not available. Please rebuild the app with native dependencies.');
            console.warn('[ScreenTime] Native module UsageStatsManager is not linked.');
            return;
        }

        setError(null);
        try {
            const hasPerm = await checkForPermission();
            setHasPermission(Boolean(hasPerm));

            if (hasPerm) {
                await loadStats();
            }
        } catch (err) {
            const message = err?.message || String(err);
            console.error('[ScreenTime] Permission check failed:', message);

            if (message.includes('not linked') || message.includes('could not be found') || message.includes('LINKING_ERROR')) {
                setModuleAvailable(false);
                setError('Screen time module is not properly linked. Please rebuild the app.');
            } else {
                setError(`Failed to check permissions: ${message}`);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkPermissionAndLoad();
        }, [])
    );

    const loadStats = async () => {
        if (!queryAndAggregateUsageStats) {
            setError('Usage stats query function is not available.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const endOfDay = now.getTime();

            // Validate time range
            if (startOfDay >= endOfDay) {
                setStats([]);
                setLoading(false);
                return;
            }

            const rawData = await queryAndAggregateUsageStats(startOfDay, endOfDay);

            if (rawData === null || rawData === undefined) {
                console.warn('[ScreenTime] queryAndAggregateUsageStats returned null/undefined');
                setStats([]);
                setError('No usage data returned. Make sure Usage Access is enabled in Settings.');
                return;
            }

            // Handle both object map and array formats
            let statsArray;
            if (Array.isArray(rawData)) {
                statsArray = rawData;
            } else if (typeof rawData === 'object') {
                statsArray = Object.values(rawData);
            } else {
                console.warn('[ScreenTime] Unexpected data format:', typeof rawData);
                setStats([]);
                setError('Received unexpected data format from usage stats.');
                return;
            }

            // Filter: > 1 minute usage, exclude our own app, must have packageName
            const validStats = statsArray.filter(s =>
                s &&
                s.packageName &&
                typeof s.totalTimeInForeground === 'number' &&
                s.totalTimeInForeground > 60000 &&
                s.packageName !== 'com.personallife.app'
            );

            validStats.sort((a, b) => (b.totalTimeInForeground || 0) - (a.totalTimeInForeground || 0));
            setStats(validStats.slice(0, 7)); // Top 7
        } catch (err) {
            const message = err?.message || String(err);
            console.error('[ScreenTime] Failed to load stats:', message);

            if (message.includes('SecurityException') || message.includes('permission')) {
                setHasPermission(false);
                setError('Usage access permission was revoked. Please re-enable it.');
            } else if (message.includes('not linked') || message.includes('could not be found')) {
                setModuleAvailable(false);
                setError('Screen time module is not properly linked.');
            } else {
                setError(`Failed to load screen time: ${message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGrantPermission = () => {
        try {
            if (showUsageAccessSettings) {
                showUsageAccessSettings('com.personallife.app');
            } else {
                Alert.alert('Error', 'Cannot open usage settings. The native module is not available.');
                return;
            }
        } catch (err) {
            console.error('[ScreenTime] Failed to open settings:', err);
            Alert.alert('Error', 'Could not open Usage Access settings. Please go to Settings > Security > Usage Access manually.');
            return;
        }

        Alert.alert(
            'Permission Required',
            'Please enable Usage Access for "Personal Life" in the settings screen that just opened, then come back to the app.',
            [{ text: 'OK', onPress: () => setTimeout(checkPermissionAndLoad, 1000) }]
        );
    };

    const handleRetry = () => {
        setError(null);
        checkPermissionAndLoad();
    };

    if (Platform.OS !== 'android') {
        return null;
    }

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="cellphone-check" size={24} color={colors.accent} />
                    <Text style={styles.title}>Screen Time</Text>
                    {hasPermission && stats.length > 0 && (
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalText}>{getTotalTime(stats)}</Text>
                        </View>
                    )}
                </View>
                {hasPermission && (
                    <TouchableOpacity onPress={loadStats} style={styles.refreshBtn}>
                        <MaterialCommunityIcons name="refresh" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Module not available */}
            {!moduleAvailable ? (
                <View style={styles.errorBox}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={28} color={colors.warning} />
                    <Text style={styles.errorText}>{error || 'Screen time tracking is not available on this build.'}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : !hasPermission ? (
                <View style={styles.permissionBox}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={32} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
                    <Text style={styles.permissionText}>
                        Enable usage access to see your daily screen time stats and identify distractions.
                    </Text>
                    <TouchableOpacity style={styles.btn} onPress={handleGrantPermission}>
                        <Text style={styles.btnText}>Grant Access</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color={colors.accent} />
                    <Text style={styles.loadingText}>Fetching screen time...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorBox}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={28} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : stats.length === 0 ? (
                <View style={styles.emptyBox}>
                    <MaterialCommunityIcons name="sleep" size={28} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No screen time data recorded yet today.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                        <Text style={styles.retryText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.list}>
                    {stats.map((app, i) => {
                        const maxTime = stats[0]?.totalTimeInForeground || 1;
                        const barWidth = Math.max(10, (app.totalTimeInForeground / maxTime) * 100);
                        return (
                            <View key={app.packageName || i} style={styles.appRow}>
                                <View style={styles.appInfo}>
                                    <View style={[styles.appRank, i === 0 && styles.appRankTop]}>
                                        <Text style={[styles.rankText, i === 0 && styles.rankTextTop]}>{i + 1}</Text>
                                    </View>
                                    <View style={styles.appDetails}>
                                        <Text style={styles.appName} numberOfLines={1}>{getFriendlyName(app.packageName)}</Text>
                                        <View style={styles.barContainer}>
                                            <View style={[styles.bar, { width: `${barWidth}%` }, i === 0 && styles.barTop]} />
                                        </View>
                                    </View>
                                </View>
                                <Text style={[styles.appTime, i === 0 && styles.appTimeTop]}>
                                    {formatTime(app.totalTimeInForeground)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg, padding: 0 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    totalBadge: {
        backgroundColor: colors.accentDim, paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 12, marginLeft: 4,
    },
    totalText: { ...typography.caption, color: colors.accent, fontWeight: '700' },
    refreshBtn: { padding: 4 },

    // Permission state
    permissionBox: { padding: spacing.xl, alignItems: 'center' },
    permissionText: {
        ...typography.caption, color: colors.textSecondary,
        textAlign: 'center', marginBottom: spacing.md, lineHeight: 20,
    },
    btn: {
        backgroundColor: colors.accent, paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm, borderRadius: 8,
    },
    btnText: { ...typography.bodyBold, color: colors.background },

    // Loading state
    loadingBox: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
    loadingText: { ...typography.caption, color: colors.textMuted },

    // Error state
    errorBox: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
    errorText: {
        ...typography.caption, color: colors.textSecondary,
        textAlign: 'center', lineHeight: 18,
    },
    retryBtn: {
        backgroundColor: colors.surface, paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm, borderRadius: 8,
        borderWidth: 1, borderColor: colors.borderLight, marginTop: spacing.xs,
    },
    retryText: { ...typography.caption, color: colors.accent, fontWeight: '600' },

    // Empty state
    emptyBox: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
    emptyText: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

    // Stats list
    list: { padding: spacing.sm },
    appRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
    },
    appInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    appRank: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    appRankTop: { backgroundColor: colors.accentDim },
    rankText: { ...typography.caption, color: colors.accent, fontWeight: 'bold', fontSize: 11 },
    rankTextTop: { color: colors.accent },
    appDetails: { flex: 1 },
    appName: { ...typography.body, color: colors.textPrimary, fontSize: 13 },
    barContainer: {
        height: 3, backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2, marginTop: 4, overflow: 'hidden',
    },
    bar: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
    barTop: { backgroundColor: colors.accent },
    appTime: { ...typography.bodyBold, color: colors.textSecondary, fontSize: 13, minWidth: 50, textAlign: 'right' },
    appTimeTop: { color: colors.accent },
});

export default ScreenTimeTracker;
