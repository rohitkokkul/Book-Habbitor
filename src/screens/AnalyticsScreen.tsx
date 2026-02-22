import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAnalytics, ReadingAnalytics } from '../services/analyticsService';
import SimpleBarChart from '../components/SimpleBarChart';

const AnalyticsScreen = (): React.JSX.Element => {
    const [data, setData] = useState<ReadingAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchAnalytics = async () => {
                setIsLoading(true);
                const stats = await getAnalytics();
                if (isActive) {
                    setData(stats);
                    setIsLoading(false);
                }
            };

            fetchAnalytics();

            return () => {
                isActive = false;
            };
        }, [])
    );

    if (isLoading || !data) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#222222" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                </View>

                {/* 7-Day Chart Block */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Last 7 Days (Minutes)</Text>
                    <SimpleBarChart data={data.past7DaysMinutes} />
                    <View style={styles.chartXLabels}>
                        <Text style={styles.chartLabel}>Past</Text>
                        <Text style={styles.chartLabel}>Today</Text>
                    </View>
                </View>

                {/* Plain Text Metrics List */}
                <View style={styles.metricsList}>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Current Streak</Text>
                        <Text style={styles.metricValue}>{data.currentStreak} {data.currentStreak === 1 ? 'Day' : 'Days'}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Longest Streak</Text>
                        <Text style={styles.metricValue}>{data.longestStreak} {data.longestStreak === 1 ? 'Day' : 'Days'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Today</Text>
                        <Text style={styles.metricValue}>{data.todayMinutes} {data.todayMinutes === 1 ? 'Min' : 'Mins'}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>This Week</Text>
                        <Text style={styles.metricValue}>{data.weeklyMinutes} {data.weeklyMinutes === 1 ? 'Min' : 'Mins'}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>This Month</Text>
                        <Text style={styles.metricValue}>{data.monthlyMinutes} {data.monthlyMinutes === 1 ? 'Min' : 'Mins'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Total Lifetime</Text>
                        <Text style={styles.metricValue}>{data.lifetimeHours} {data.lifetimeHours === 1 ? 'Hour' : 'Hours'}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Books in Library</Text>
                        <Text style={styles.metricValue}>{data.totalBooks}</Text>
                    </View>

                </View>
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
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#222222',
    },
    section: {
        marginBottom: 48,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 16,
    },
    chartXLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    chartLabel: {
        fontSize: 12,
        color: '#888888',
    },
    metricsList: {
        gap: 16,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 16,
        color: '#666666',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 8,
    },
});

export default AnalyticsScreen;
