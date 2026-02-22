import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { pickAndStorePdf } from '../services/pdfService';
import { getDBConnection, insertBook, Book } from '../database/schema';

const UploadScreen = ({ navigation }: any): React.JSX.Element => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleUpload = async () => {
        setIsLoading(true);
        setMessage(null);

        const result = await pickAndStorePdf();

        if (result.success && result.filePath && result.fileName) {
            try {
                // Initialize DB connection and save the book
                const db = await getDBConnection();
                const newBook: Book = {
                    id: Date.now().toString(),
                    title: result.fileName.replace('.pdf', ''),
                    filePath: result.filePath,
                    fileName: result.fileName,
                    currentPage: 1,
                    totalPages: result.totalPages || 1,
                    lastReadAt: Date.now(),
                    createdAt: Date.now(),
                };

                await insertBook(db, newBook);

                setMessage({ text: 'PDF saved to your library successfully!', isError: false });

                setTimeout(() => {
                    navigation.navigate('Library');
                }, 1500);
            } catch (dbError) {
                setMessage({ text: 'Failed to save book to database.', isError: true });
                console.error(dbError);
            }
        } else {
            setMessage({ text: result.error || 'Failed to upload document', isError: true });
        }

        setIsLoading(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Add PDF</Text>
                <View style={{ width: 40 }} /> {/* Placeholder to center title */}
            </View>

            <View style={styles.container}>
                {/* Loading State Spinner */}
                {isLoading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#222222" style={{ marginBottom: 16 }} />
                        <Text style={styles.loadingText}>Processing document...</Text>
                    </View>
                ) : (
                    <View style={styles.centerBox}>
                        <Text style={styles.instructions}>
                            Select a PDF document from your device to add to your library.
                            Only .pdf files are supported.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleUpload}
                        >
                            <Text style={styles.primaryButtonText}>Select File</Text>
                        </TouchableOpacity>

                        {/* Error or Success Text */}
                        {message && (
                            <Text style={[styles.messageText, message.isError && styles.errorText]}>
                                {message.text}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222222',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    centerBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructions: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666666',
    },
    primaryButton: {
        backgroundColor: '#222222',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    messageText: {
        marginTop: 24,
        fontSize: 14,
        textAlign: 'center',
        color: '#2E7D32', // Success Green
        lineHeight: 20,
    },
    errorText: {
        color: '#D32F2F', // Error Red
    },
});

export default UploadScreen;
