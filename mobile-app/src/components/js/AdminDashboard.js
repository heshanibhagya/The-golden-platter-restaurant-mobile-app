import React, { useContext, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from '../css/AdminDashboardStyles'; // Import styles
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminDashboard = () => {
    const router = useRouter();
    const { userToken, logout, isLoading } = useContext(AuthContext);

    // Strengthened Authentication - Verify token existence
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token && !isLoading) {
                // If token is missing, redirect to login
                router.replace('/login');
            }
        };
        checkToken();
    }, [userToken, isLoading]);

    const handleLogout = () => {
        // Confirmation Alert with "Yes" button
        Alert.alert("Logout", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Yes", 
                onPress: async () => {
                    await AsyncStorage.clear(); // Destroy session
                    await logout();
                    router.replace('/login');
                } 
            }
        ]);
    };

    if (isLoading) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Header Section with Background Image */}
                <ImageBackground 
                    source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.headerBackground}
                    imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
                >
                    <View style={styles.headerOverlay} />
                    
                    {/* Header Icons Wrapper (Absolute Positioning) */}
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.bellButton}>
                            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <MaterialIcons name="logout" size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.brandText}>THE GOLDEN PLATTER</Text>
                            <Text style={styles.welcomeText}>Welcome, Admin!</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Key Metrics Section */}
                <View style={styles.metricsContainer}>
                    <View style={styles.card}>
                        <MaterialIcons name="shopping-cart" size={30} color="#FFD700" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Today's Orders</Text>
                        <Text style={styles.cardValue}>25 Orders</Text>
                        <Text style={styles.growthText}>+12% from yesterday</Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="restaurant-menu" size={30} color="#FFD700" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Menu Items</Text>
                        <Text style={styles.cardValue}>112 Items</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
                            <Text style={styles.manageLink}>Manage Menu</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="kitchen" size={30} color="#FFD700" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>KDS Status</Text>
                        <Text style={styles.cardValue}>8 Active</Text>
                        <Text style={styles.kdsStatus}>3 Ready | 5 Pending</Text>
                    </View>

                    <View style={styles.card}>
                        <MaterialIcons name="payments" size={30} color="#FFD700" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Total Sales</Text>
                        <Text style={styles.cardValue}>LKR 24,500</Text>
                        <Text style={styles.growthText}>Daily Target: 80%</Text>
                    </View>
                </View>

                {/* Quick Actions Section */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/admin-orders')}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="add-shopping-cart" size={24} color="#FFD700" />
                        </View>
                        <Text style={styles.actionText}>Add New Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/add-menu')}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="edit" size={24} color="#FFD700" />
                        </View>
                        <Text style={styles.actionText}>Update Menu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/kitchen-display')}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="monitor" size={24} color="#FFD700" />
                        </View>
                        <Text style={styles.actionText}>View KDS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/bulk-orders')}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="event-note" size={24} color="#FFD700" />
                        </View>
                        <Text style={styles.actionText}>Bulk Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/billing-list')}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="receipt" size={24} color="#FFD700" />
                        </View>
                        <Text style={styles.actionText}>Billing & Invoices</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminDashboard;
