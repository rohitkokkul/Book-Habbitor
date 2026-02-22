import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    AppState,
    AppStateStatus,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { ReadingTracker } from '../utils/readingTracker';
import { getDBConnection, updateBookProgress, saveReadingSession } from '../database/schema';

const ReaderScreen = ({ route, navigation }: any): React.JSX.Element => {
    // In a full implementation, the book object is passed dynamically via navigation params
    const book = route?.params?.book || {
        id: 'placeholder',
        title: 'Loading Book...',
        filePath: '',
        currentPage: 1,
        totalPages: 100,
    };

    const [uiVisible, setUiVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(book.currentPage);
    const [totalPages, setTotalPages] = useState(book.totalPages);

    const trackerRef = useRef(new ReadingTracker());

    useEffect(() => {
        // 1. Start tracker immediately when the screen boots up
        trackerRef.current.start();

        // 2. Setup AppState listener to handle foreground/background tracking seamlessly
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                trackerRef.current.resume();
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                trackerRef.current.pause();
            }
        });

        // 3. Clean up and formally save when screen unmounts
        return () => {
            subscription.remove();
        };
    }, []);

    const toggleUi = () => {
        setUiVisible(!uiVisible);
    };

    const handleGoBack = async () => {
        try {
            const db = await getDBConnection();

            // Stop tracker and retrieve safe aggregated seconds
            const finalDuration = trackerRef.current.stopAndGetSeconds();

            // Persist the duration
            if (book.id !== 'placeholder') {
                await saveReadingSession(db, book.id, finalDuration);

                // Persist the currentPage tracking
                await updateBookProgress(db, book.id, currentPage);
            }
        } catch (e) {
            console.error('Failed saving reading session:', e);
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={!uiVisible} translucent backgroundColor="transparent" barStyle="dark-content" />

            {/* PDF Viewer */}
            <Pdf
                source={{ uri: book.filePath, cache: true }}
                onLoadComplete={(numberOfPages) => {
                    setTotalPages(numberOfPages);
                }}
                onPageChanged={(page) => {
                    setCurrentPage(page);
                }}
                onError={(error) => {
                    console.warn('PDF Error:', error);
                }}
                onPageSingleTap={() => {
                    toggleUi();
                }}
                style={styles.pdf}
                page={book.currentPage} // Start reading exactly where we left off
                spacing={0}
                fitPolicy={0}
            />

            {/* Overlay UI - Toggles visible on tap, intercepts touches to prevent page turn while using UI */}
            {uiVisible && (
                <View style={styles.overlayContainer}>
                    {/* Top Bar */}
                    <SafeAreaView style={styles.topBarSafe}>
                        <View style={styles.topBar}>
                            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                                <Text style={styles.backButtonText}>{'<- Back'}</Text>
                            </TouchableOpacity>
                            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                                {book.title}
                            </Text>
                            <View style={styles.placeholder} />
                        </View>
                    </SafeAreaView>

                    {/* Bottom Bar */}
                    <SafeAreaView style={styles.bottomBarSafe}>
                        <View style={styles.bottomBar}>
                            <Text style={styles.pageIndicator}>
                                {currentPage} / {totalPages}
                            </Text>
                        </View>
                    </SafeAreaView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F9F9F9',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        pointerEvents: 'box-none', // Let native touches pass through the blank middle space into the PDF
    },
    topBarSafe: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    backButtonText: {
        color: '#222222',
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        flex: 1,
        color: '#222222',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    placeholder: {
        width: 60, // Matches width roughly of back buttons to center title
    },
    bottomBarSafe: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    bottomBar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    pageIndicator: {
        color: '#222222',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ReaderScreen;
