import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { saveUserName, setHasLaunched } from '../utils/storage';

const WelcomeScreen = ({ navigation }: any): React.JSX.Element => {
    const [name, setName] = useState('');

    const finishOnboarding = async () => {
        await setHasLaunched();
        navigation.replace('Library');
    };

    const handleContinue = async () => {
        await saveUserName(name);
        await finishOnboarding();
    };

    const handleSkip = async () => {
        await finishOnboarding();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Build a daily reading habit</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Your name (optional)"
                        placeholderTextColor="#888888"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
                        <Text style={styles.primaryButtonText}>Continue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
                        <Text style={styles.secondaryButtonText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '400',
    },
    inputContainer: {
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#222222',
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#222222',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default WelcomeScreen;
