import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    RefreshControl,
    Image 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../src/config';
import styles from '../../src/components/css/AdminOrderStyles';

export default function AdminOrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    // Backend eken okkoma orders tika fetch karana function eka
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
            Alert.alert("Error", "Failed to load orders from the server.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Status eka 'Ready' widiyata update karana function eka (PUT request)
    const markAsReady = async (orderId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`, 
                { status: 'Ready' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert("Success", "Order marked as Ready!");
                // Local state eka update karanawa kichen staff ekata lesi wenna
                setOrders(prev => prev.map(order => 
                    order._id === orderId ? { ...order, status: 'Ready' } : order
                ));
            }
        } catch (error) {
            Alert.alert("Error", "Could not update order status.");
        }
    };

    // Order eka delete karana function eka (DELETE request)
    const cancelOrder = async (orderId) => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel and remove this order?",
            [
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
                            Alert.alert("Deleted", "Order has been removed.");
                            setOrders(prev => prev.filter(order => order._id !== orderId));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete order.");
                        }
                    }
                }
            ]
        );
    };

    const renderOrderItem = ({ item }) => (
        <View style={[styles.orderCard, item.status === 'Ready' && styles.readyCard]}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order ID: {item._id.slice(-6).toUpperCase()}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Order items list eka display karanawa */}
            {item.items.map((food, index) => (
                <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{food.name}</Text>
                    <Text style={styles.itemQty}>x{food.quantity}</Text>
                </View>
            ))}

            {/* ✅ Special Note Image (Customer Uploaded) */}
            {item.customerNoteImage && (
                <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#FFD700', fontSize: 13, marginBottom: 4 }}>* Customer Special Note Photo:</Text>
                    <Image 
                        source={{ uri: `${API_BASE_URL.replace('/api', '')}${item.customerNoteImage}` }} 
                        style={{ width: '100%', height: 120, borderRadius: 8, resizeMode: 'cover' }} 
                    />
                </View>
            )}

            {/* ✅ Final Dish Image (Kitchen Uploaded when Ready) */}
            {item.status === 'Ready' && item.finalDishImage && (
                <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#FFD700', fontSize: 13, marginBottom: 4, fontWeight: 'bold' }}>Final Prepared Dish Photo:</Text>
                    <Image 
                        source={{ uri: `${API_BASE_URL.replace('/api', '')}${item.finalDishImage}` }} 
                        style={{ width: '100%', height: 150, borderRadius: 10, resizeMode: 'cover', borderWidth: 1, borderColor: '#333' }} 
                    />
                </View>
            )}

            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalPrice}>Rs. {item.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.actionButtons}>
                {item.status === 'Pending' && (
                    <TouchableOpacity 
                        style={styles.completeBtn} 
                        onPress={() => markAsReady(item._id)}
                    >
                        <Text style={styles.btnText}>Mark as Ready</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => cancelOrder(item._id)}
                >
                    <Text style={styles.btnText}>Cancel Order</Text>
                </TouchableOpacity>
            </View>
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
            <Text style={styles.title}>Admin Orders Dashboard</Text>
            
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor="#FFD700" />
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No orders currently available.</Text>}
            />
        </View>
    );
}
