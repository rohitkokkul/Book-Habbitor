import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Navigation } from './src/navigation/Navigation';
import { initDatabase } from './src/database/schema';

const App = (): React.JSX.Element => {
    useEffect(() => {
        // Scaffold SQLite on boot
        initDatabase();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Navigation />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});

export default App;
