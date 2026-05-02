import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';

export default function Index() {
    const { userToken, isLoading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        // Perform authentication check after loading is complete
        if (!isLoading) {
            if (userToken) {
                // If token exists, redirect to Admin Dashboard
                router.replace('/(tabs)/admin-dashboard');
            } else {
                // If token is missing, redirect to Login screen
                router.replace('/login');
            }
        }
    }, [userToken, isLoading]);

    // Show loading spinner while checking authentication status
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
            <ActivityIndicator size="large" color="#FFD700" />
        </View>
    );
}

/**
 * What it does:
 * This is the root entry screen that executes when the app is opened. 
 * It checks the authentication status using AuthContext.
 * 
 * Why it's used:
 * 1. To navigate directly to the Dashboard if a token exists.
 * 2. To redirect to the Login screen if no token is found.
 * 3. Ensures secure navigation by verifying session existence before showing any UI.
 */
