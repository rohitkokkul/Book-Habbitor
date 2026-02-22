import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserName, saveUserName, setHasLaunched } from '../utils/storage';
import { getDBConnection, clearAllDatabaseData } from '../database/schema';
import { executeCompleteDataWipe } from '../services/deletionService';

const SettingsScreen = ({ navigation }: any): React.JSX.Element => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadName = async () => {
            const currentName = await getUserName();
            if (currentName) {
                setName(currentName);
            }
        };
        loadName();
    }, []);

    const handleSaveName = async () => {
        setIsSaving(true);
        await saveUserName(name);
        setIsSaving(false);
        Alert.alert('Saved', 'Your name has been successfully updated.');
    };

    const handleWipeData = () => {
        Alert.alert(
            'Delete All Data',
            'Are you sure you want to permanently delete all books, reading sessions, and settings from this device? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Single source of truth for deletion
                            await executeCompleteDataWipe();

                            // Kick user back to Welcome screen gracefully
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            });
                        } catch (e) {
                            Alert.alert('Error', 'Failed to clear application data completely.');
                        }
                    }
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Settings</Text>

                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <Text style={styles.label}>Your Name</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#888888"
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                            onPress={handleSaveName}
                            disabled={isSaving}
                        >
                            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <TouchableOpacity style={styles.dangerButton} onPress={handleWipeData}>
                        <Text style={styles.dangerButtonText}>Delete all data</Text>
                    </TouchableOpacity>
                    <Text style={styles.dangerDescription}>
                        Permanently erases all reading history, library entries, and settings from this device.
                    </Text>
                </View>

                {/* App Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>About Privacy</Text>
                    <Text style={styles.infoText}>
                        Book Habbitor uses local-only storage. This means your data, including your reading habit metrics and PDF documents, never leaves your Android device. We do not sync your data to any cloud service.
                    </Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
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
        paddingTop: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 40,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#222222',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#222222',
    },
    saveButton: {
        backgroundColor: '#222222',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#999999',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    dangerButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D32F2F',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 8,
    },
    dangerButtonText: {
        color: '#D32F2F',
        fontSize: 16,
        fontWeight: '600',
    },
    dangerDescription: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    infoSection: {
        marginTop: 'auto',
        marginBottom: 40,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 16,
    },
    appVersion: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
    },
});

export default SettingsScreen;
