import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create AuthContext to share authentication state across the app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Define state variables
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if a token exists when the app starts
    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            // Retrieve token from AsyncStorage
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                setUserToken(token);
            }
            setIsLoading(false);
        } catch (error) {
            console.log("Check Login Status Error:", error);
            setIsLoading(false);
        }
    };

    // Login function - Save token when user logs in
    const login = async (token) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
        } catch (error) {
            console.log("Login Save Error:", error);
        }
    };

    // Logout function - Remove token and clear storage
    const logout = async () => {
        try {
            await AsyncStorage.clear(); // Clear all data from storage
            setUserToken(null);
        } catch (error) {
            console.log("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, isAuthenticated: !!userToken, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * What it does:
 * AuthContext provides the authentication state (user token) to the entire app.
 * It uses AsyncStorage to persist the token on the device.
 * 
 * Why it's used:
 * 1. To track the user's login status globally across all components.
 * 2. To enable automatic login by checking the saved token on app restart.
 */
