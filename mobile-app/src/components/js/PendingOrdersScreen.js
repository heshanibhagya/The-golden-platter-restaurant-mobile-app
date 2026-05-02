import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import styles from '../css/PendingOrdersStyles';

/**
 * PendingOrdersScreen Component
 * 
 * What it does:
 * Fetches and displays orders that have been marked as 'Ready' by the kitchen.
 * Clicking on an order card navigates to the Billing form.
 * 
 * Why it's used:
 * Used to view the list of ready orders for the billing section and send them to billing.
 * Maintains a modern look with the project's Black and Yellow theme.
 */

const PendingOrdersScreen = () => {
    const [orders, setOrders] = useState([]); // Normal orders
    const [bulkOrders, setBulkOrders] = useState([]); // Bulk orders
    const [activeTab, setActiveTab] = useState('Normal'); // Default tab is Normal
    const [loading, setLoading] = useState(true); 
    const { userToken } = useContext(AuthContext); 
    const router = useRouter(); 

    // Function to fetch 'Pending' status orders (Normal and Bulk)
    const fetchAllPendingOrders = async () => {
        try {
            // Normal orders appear in billing list when 'Ready' (finished in Kitchen)
            // Bulk orders appear in billing list when 'Pending' (created directly)
            const [normalRes, bulkRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/orders/ready`, { headers: { Authorization: `Bearer ${userToken}` } }),
                axios.get(`${API_BASE_URL}/bulk-orders`, { headers: { Authorization: `Bearer ${userToken}` } }) 
            ]);

            if (normalRes.data.success) setOrders(normalRes.data.orders);
            
            // Filter bulk orders with 'Pending' status
            const pendingBulk = bulkRes.data.filter(o => o.status === 'Pending');
            setBulkOrders(pendingBulk);
        } catch (error) {
            console.error("Fetch orders error:", error);
            Alert.alert("Error", "Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    // Call fetch function on component load
    useEffect(() => {
        if (userToken) {
            fetchAllPendingOrders();
        }
    }, [userToken]);

    // Navigate to BillingForm when an order card is pressed
    const handleOrderPress = (order) => {
        router.push({
            pathname: '/(tabs)/billing-form', 
            params: { 
                orderId: order._id, 
                totalAmount: order.totalAmount,
                isBulk: activeTab === 'Bulk' ? 'true' : 'false' // Flag to indicate if it's a bulk order
            }
        });
    };

    // Function to render a single row in the list
    const renderOrderItem = ({ item }) => {
        const isBulkTab = activeTab === 'Bulk';

        return (
            <TouchableOpacity 
                style={styles.orderCard} 
                onPress={() => handleOrderPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>{isBulkTab ? 'Bulk Order' : 'Order'} #{item._id.slice(-6).toUpperCase()}</Text>
                    <View style={styles.readyBadge}>
                        <Text style={styles.readyText}>{isBulkTab ? 'PENDING' : 'READY'}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <MaterialIcons name="person" size={16} color="#FFD700" />
                    <Text style={styles.customerInfo}> {isBulkTab ? item.customerName : (item.userId?.name || 'Guest Customer')}</Text>
                </View>

                {isBulkTab ? (
                    <View style={{ marginTop: 10 }}>
                        <View style={styles.amountContainer}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalAmount}>LKR {item.totalAmount?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.totalLabel}>Advance Paid:</Text>
                            <Text style={[styles.totalAmount, { color: '#4CAF50' }]}>LKR {item.advanceAmount?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.totalLabel}>Remaining Balance:</Text>
                            <Text style={[styles.totalAmount, { color: '#FFD700' }]}>LKR {item.remainingBalance?.toFixed(2)}</Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="email" size={16} color="#FFD700" />
                            <Text style={styles.customerInfo}> {item.userId?.email || 'N/A'}</Text>
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.totalLabel}>Total Payable:</Text>
                            <Text style={styles.totalAmount}>LKR {item.totalAmount.toFixed(2)}</Text>
                        </View>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={{ color: '#AAAAAA', marginTop: 10 }}>Fetching orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Ready to Bill</Text>

            {/* Tab View (Segmented Control) */}
            <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: '#1E1E1E', borderRadius: 10, padding: 5 }}>
                <TouchableOpacity 
                    style={{ flex: 1, padding: 10, alignItems: 'center', backgroundColor: activeTab === 'Normal' ? '#FFD700' : 'transparent', borderRadius: 8 }}
                    onPress={() => setActiveTab('Normal')}
                >
                    <Text style={{ color: activeTab === 'Normal' ? '#000' : '#AAA', fontWeight: 'bold' }}>Normal Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{ flex: 1, padding: 10, alignItems: 'center', backgroundColor: activeTab === 'Bulk' ? '#FFD700' : 'transparent', borderRadius: 8 }}
                    onPress={() => setActiveTab('Bulk')}
                >
                    <Text style={{ color: activeTab === 'Bulk' ? '#000' : '#AAA', fontWeight: 'bold' }}>Bulk Orders</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={activeTab === 'Normal' ? orders : bulkOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="receipt-long" size={80} color="#333" />
                        <Text style={styles.emptyText}>No {activeTab} ready orders found yet.</Text>
                    </View>
                }
                refreshing={loading}
                onRefresh={fetchAllPendingOrders} 
            />
        </View>
    );
};

export default PendingOrdersScreen;
