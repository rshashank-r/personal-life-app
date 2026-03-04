import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Navigation from './src/navigation/Navigation';
import { db } from './src/core/database';
import { notificationService } from './src/core/notifications';
import { colors, typography } from './src/core/theme';
import useProfileStore from './src/core/store/useProfileStore';
import OnboardingScreen from './src/features/onboarding/screens/OnboardingScreen';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync(MaterialCommunityIcons.font);
        await db.getDB();
        await notificationService.init();
        await useProfileStore.getState().loadProfile();
      } catch (e) {
        console.error('App init error:', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const profile = useProfileStore(state => state.profile);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <Text style={styles.splashTitle}>Personal</Text>
        <Text style={styles.splashSub}>Your life, organized</Text>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {!profile ? (
        <OnboardingScreen />
      ) : (
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.accent,
              background: colors.background,
              card: colors.surface,
              text: colors.textPrimary,
              border: colors.border,
              notification: colors.accent,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}>
          <Navigation />
        </NavigationContainer>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  splashTitle: { ...typography.h1, color: colors.accent, fontSize: 36, letterSpacing: -1 },
  splashSub: { ...typography.body, color: colors.textSecondary, marginTop: 8 },
});
