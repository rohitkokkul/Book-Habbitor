import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface BookRowProps {
    /** The title of the book */
    title: string;
    /** The current page the user is on */
    currentPage: number;
    /** The total number of pages in the book */
    totalPages: number;
    /** A relative string representing when the book was last read (e.g., "2 hours ago", "Yesterday") */
    lastReadRelative: string;
    /** Optional callback for when the row is pressed */
    onPress?: () => void;
}

const BookRow: React.FC<BookRowProps> = ({
    title,
    currentPage,
    totalPages,
    lastReadRelative,
    onPress,
}) => {
    // Calculate progress percentage (0 to 100) safely
    const progressPercentage = totalPages > 0
        ? Math.min(Math.max((currentPage / totalPages) * 100, 0), 100)
        : 0;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.timestamp}>{lastReadRelative}</Text>
            </View>

            <Text style={styles.progressText}>
                Page {currentPage} of {totalPages}
            </Text>

            <View style={styles.progressBarBackground}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${progressPercentage}%` },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        backgroundColor: '#FFFFFF',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        gap: 16, // Ensure the title and timestamp don't overlap if the title is very long
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
    },
    timestamp: {
        fontSize: 12,
        color: '#888888',
        fontWeight: '400',
        flexShrink: 0,
    },
    progressText: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 10,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#222222', // Darker color indicating fill progress
        borderRadius: 2,
    },
});

export default BookRow;
