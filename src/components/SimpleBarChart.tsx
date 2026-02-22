import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface SimpleBarChartProps {
    /** Array of values. Exactly 7 length expected. */
    data: number[];
    /** Maximum expected value to properly scale the bars */
    maxDataValue?: number;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, maxDataValue }) => {
    // Ensure we at least have 7 elements, padding with 0 if necessary
    const safeData = [...data];
    while (safeData.length < 7) {
        safeData.unshift(0);
    }

    // Derive maximum if not provided, fallback to 1 to avoid divide by zero
    const maxVal = maxDataValue ? Math.max(maxDataValue, ...safeData) : Math.max(1, ...safeData);

    return (
        <View style={styles.container}>
            {safeData.map((value, index) => {
                const heightPercentage = Math.max((value / maxVal) * 100, 0); // Cap bottom at 0 just in case
                return (
                    <View key={index} style={styles.barContainer}>
                        <View style={[styles.barFill, { height: `${heightPercentage}%` }]} />
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        width: '100%',
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    barContainer: {
        flex: 1,
        height: '100%',
        marginHorizontal: 4,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    barFill: {
        width: '100%',
        backgroundColor: '#999999', // Neutral grey for inactive/past bars
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 2, // So zero values still show a tiny tick
    },
});

export default SimpleBarChart;
