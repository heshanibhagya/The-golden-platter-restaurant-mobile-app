import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    RefreshControl 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../src/config';
import styles from '../src/components/css/AdminOrderStyles';

export default function OrderManagementScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    // Fetch orders from backend
    const fetchOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            Alert.alert("Error", "Failed to load orders.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Update status eka karana function eka
    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert("Success", `Order status updated to ${newStatus}`);
                setOrders(prev => prev.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update status.");
        }
    };

    // Delete order logic
    const deleteOrder = async (orderId) => {
        Alert.alert("Cancel Order", "Are you sure?", [
            { text: "No" },
            { 
                text: "Yes, Cancel", 
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setOrders(prev => prev.filter(order => order._id !== orderId));
                        Alert.alert("Success", "Order removed successfully.");
                    } catch (error) {
                        Alert.alert("Error", "Failed to cancel order.");
                    }
                }
            }
        ]);
    };

    const renderOrderItem = ({ item }) => (
        <View style={[
            styles.orderCard, 
            item.status === 'Ready for Billing' && styles.readyCard,
            item.status === 'Completed' && styles.completedCard
        ]}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>ID: {item._id.slice(-6).toUpperCase()}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            {item.items.map((food, index) => (
                <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{food.name}</Text>
                    <Text style={styles.itemQty}>x{food.quantity}</Text>
                </View>
            ))}

            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>Rs. {item.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.actionButtons}>
                {/* Pending nam 'Ready for Billing' karanna puluwan */}
                {item.status === 'Pending' && (
                    <TouchableOpacity 
                        style={styles.completeBtn} 
                        onPress={() => updateStatus(item._id, 'Ready for Billing')}
                    >
                        <Text style={styles.btnText}>Ready for Billing</Text>
                    </TouchableOpacity>
                )}

                {/* Ready for Billing nam 'Completed' karanna puluwan */}
                {item.status === 'Ready for Billing' && (
                    <TouchableOpacity 
                        style={[styles.completeBtn, { backgroundColor: '#28a745' }]} 
                        onPress={() => updateStatus(item._id, 'Completed')}
                    >
                        <Text style={styles.btnText}>Mark as Completed</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => deleteOrder(item._id)}
                >
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Member 5 Link: Invoice viewing for completed orders */}
            {item.status === 'Completed' && (
                <TouchableOpacity 
                    style={styles.invoiceBtn} 
                    onPress={() => Alert.alert("Billing Module", "Connecting to Member 5's Invoice module...")}
                >
                    <Text style={styles.btnText}>View / Print Invoice</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order Management</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders to manage.</Text>}
            />
        </View>
    );
}
