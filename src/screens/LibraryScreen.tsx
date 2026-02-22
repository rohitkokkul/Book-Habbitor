import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { getUserName } from '../utils/storage';

const LibraryScreen = ({ navigation }: any): React.JSX.Element => {
    const [userName, setUserName] = useState<string>('Reader');

    useEffect(() => {
        const loadUserName = async () => {
            const name = await getUserName();
            if (name) {
                setUserName(name);
            }
        };
        loadUserName();
    }, []);

    const handleAddPdf = () => {
        navigation.navigate('Upload');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Good evening, {userName}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Mins today</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Day streak</Text>
                        </View>
                    </View>
                </View>

                {/* Empty State */}
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateTitle}>Your library is empty</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Add a PDF to start reading and tracking your habit.
                    </Text>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleAddPdf}>
                    <Text style={styles.primaryButtonText}>+ Add PDF</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 48,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 32,
    },
    statItem: {
        flexDirection: 'column',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 32,
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
});

export default LibraryScreen;
