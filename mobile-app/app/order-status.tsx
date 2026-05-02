import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../src/config';
import styles from '../src/components/css/OrderStatusStyles';
import { io } from 'socket.io-client';

const socket = io(API_BASE_URL.replace('/api', ''));

export default function OrderStatusScreen() {
    const [latestOrder, setLatestOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Latest order eka ganna function eka
    const fetchLatestOrder = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.orders.length > 0) {
                setLatestOrder(response.data.orders[0]);
            }
        } catch (error) {
            console.error("Fetch latest order error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestOrder();

        // ✅ REAL-TIME: Status update listener
        socket.on('statusUpdate', (data) => {
            // Me user ge order eka nam witharak refresh karanawa
            if (latestOrder && data.orderId === latestOrder._id) {
                fetchLatestOrder(false);
                Alert.alert("Order Update", `Your order is now ${data.status}!`);
            }
        });

        return () => socket.off('statusUpdate');
    }, [latestOrder]);

    // Status eka anuwa circle eke pata wenas karana function eka
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#FFD700'; // Gold
            case 'Ready': return '#00FF00'; // Lime Green
            case 'Completed': return '#00BFFF'; // Deep Sky Blue
            default: return '#FFD700';
        }
    };

    if (loading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (!latestOrder) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="fastfood" size={80} color="#333" />
                    <Text style={styles.emptyText}>No active orders found.</Text>
                    <TouchableOpacity 
                        style={styles.refreshBtn} 
                        onPress={() => router.replace('/(tabs)/menu')}
                    >
                        <Text style={styles.refreshBtnText}>Go to Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Track Your Meal</Text>
            <Text style={styles.subtitle}>Stay updated on your delicious order</Text>

            {/* --- Status Card --- */}
            <View style={styles.statusCard}>
                <Text style={styles.orderIdLabel}>ORDER ID</Text>
                <Text style={styles.orderIdValue}>#{latestOrder._id.slice(-8).toUpperCase()}</Text>

                <View style={[styles.statusCircle, { borderColor: getStatusColor(latestOrder.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(latestOrder.status) }]}>
                        {latestOrder.status.toUpperCase()}
                    </Text>
                </View>
                
                <Text style={{ color: '#888' }}>Checking for updates every 10s...</Text>
            </View>

            {/* --- Items Summary --- */}
            <View style={styles.itemsContainer}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {latestOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>x {item.quantity}</Text>
                    </View>
                ))}

                {/* ✅ Proof of Preparation (Final Dish Photo from Kitchen) */}
                {latestOrder.readyDishImage && (
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>PROOF OF PREPARATION</Text>
                        <Image 
                            source={{ uri: `${API_BASE_URL.replace('/api', '')}${latestOrder.readyDishImage}` }} 
                            style={{ width: '100%', height: 200, borderRadius: 15, resizeMode: 'cover' }} 
                        />
                        <Text style={{ color: '#888', fontSize: 12, marginTop: 5 }}>Photo taken by Kitchen Staff</Text>
                    </View>
                )}

                {/* --- Billing Note --- */}
                <View style={styles.billingNote}>
                    <Text style={styles.billingNoteText}>
                        <MaterialIcons name="info" size={16} color="#FFCC00" />
                        {"  "}Final Invoice will be generated at the billing counter.
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchLatestOrder()}>
                <Text style={styles.refreshBtnText}>Refresh Status Manually</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
