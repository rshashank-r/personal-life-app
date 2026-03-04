import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../../../core/theme';
import { Button, Input } from '../../../shared/components';
import useProfileStore from '../../../core/store/useProfileStore';

export default function OnboardingScreen() {
    const saveProfile = useProfileStore(state => state.saveProfile);

    const [step, setStep] = useState(1);

    // Step 2 Data
    const [name, setName] = useState('');
    const [dob, setDob] = useState(''); // e.g., YYYY-MM-DD

    // Step 3 Data
    const [priorities, setPriorities] = useState([]);

    // Step 4 Data
    const [reflectionTime, setReflectionTime] = useState('21:30'); // 9:30 PM default

    const priorityOptions = [
        { id: 'health', label: 'Health & Fitness', icon: 'heart-pulse' },
        { id: 'productivity', label: 'Productivity', icon: 'check-all' },
        { id: 'learning', label: 'Learning & Growth', icon: 'book-open-variant' },
        { id: 'finance', label: 'Finance', icon: 'wallet' },
        { id: 'mindfulness', label: 'Mindfulness', icon: 'meditation' },
    ];

    const togglePriority = (id) => {
        if (priorities.includes(id)) {
            setPriorities(priorities.filter(p => p !== id));
        } else {
            setPriorities([...priorities, id]);
        }
    };

    const handleFinish = async () => {
        const id = Date.now().toString(); // simple ID generator for user
        await saveProfile({
            id,
            name,
            dob,
            priorities,
            daily_reflection_time: reflectionTime
        });
    };

    const renderStep1 = () => (
        <View style={styles.content}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="star-four-points" size={64} color={colors.accent} />
            </View>
            <Text style={styles.title}>Welcome to Personal</Text>
            <Text style={styles.subtitle}>Your life, organized</Text>

            <View style={styles.buttonContainer}>
                <Button title="Get Started" onPress={() => setStep(2)} />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Let's get to know you</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>

            <View style={styles.form}>
                <Input
                    placeholder="Your Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <Text style={[styles.subtitle, { marginTop: 24, marginBottom: 8 }]}>When were you born?</Text>
                <Input
                    placeholder="YYYY-MM-DD"
                    value={dob}
                    onChangeText={setDob}
                    keyboardType="numeric"
                />
                <Text style={styles.hintText}>Example: 2003-06-24</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Continue"
                    onPress={() => setStep(3)}
                    disabled={name.trim() === '' || dob.trim() === ''}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.content}>
            <Text style={styles.title}>What matters most?</Text>
            <Text style={styles.subtitle}>Select areas you want to focus on.</Text>

            <View style={styles.prioritiesContainer}>
                {priorityOptions.map((option) => {
                    const isSelected = priorities.includes(option.id);
                    return (
                        <Button
                            key={option.id}
                            title={option.label}
                            variant={isSelected ? 'primary' : 'outline'}
                            leftIcon={option.icon}
                            onPress={() => togglePriority(option.id)}
                            style={styles.priorityButton}
                        />
                    );
                })}
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Continue"
                    onPress={() => setStep(4)}
                    disabled={priorities.length === 0}
                />
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Daily Reflection</Text>
            <Text style={styles.subtitle}>When would you like to reflect on your day?</Text>

            <View style={styles.form}>
                <Input
                    placeholder="HH:MM (24-hour)"
                    value={reflectionTime}
                    onChangeText={setReflectionTime}
                    keyboardType="numeric"
                />
                <Text style={styles.hintText}>Example: 21:30 for 9:30 PM</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Let's Begin" onPress={handleFinish} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        marginTop: 16,
    },
    hintText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 4,
        marginLeft: 4,
    },
    prioritiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    priorityButton: {
        marginBottom: 12,
    },
    buttonContainer: {
        marginTop: 48,
        alignItems: 'center',
    }
});
