import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import UploadScreen from '../screens/UploadScreen';
import ReaderScreen from '../screens/ReaderScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getHasLaunched } from '../utils/storage';

export type RootStackParamList = {
    Welcome: undefined;
    Library: undefined;
    Upload: undefined;
    Reader: undefined;
    Analytics: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = (): React.JSX.Element | null => {
    const [isReady, setIsReady] = useState(false);
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Welcome');

    useEffect(() => {
        const checkLaunchStatus = async () => {
            const hasLaunched = await getHasLaunched();
            if (hasLaunched) {
                setInitialRoute('Library');
            }
            setIsReady(true);
        };
        checkLaunchStatus();
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#222222" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Library" component={LibraryScreen} />
                <Stack.Screen name="Upload" component={UploadScreen} />
                <Stack.Screen name="Reader" component={ReaderScreen} />
                <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
