import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../src/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; 

export default function BulkOrdersSchedule() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch bulk order data from the backend
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/bulk-orders`);
            
            // Validate that the response is an array
            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Invalid data format received:', response.data);
                setOrders([]);
            }
        } catch (error) {
            console.error('Fetch Bulk Orders Error:', error);
            if (loading) Alert.alert('Error', 'Failed to fetch bulk orders');
        } finally {
            setLoading(false);
        }
    };

    // Refresh data whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    // Function to handle bulk order deletion
    const handleDelete = (id) => {
        Alert.alert(
            "Delete Order",
            "Are you sure you want to delete this order?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/bulk-orders/${id}`);
                            Alert.alert('Success', 'Order deleted successfully');
                            // Remove deleted item from the local state list
                            setOrders(orders.filter(order => order._id !== id));
                        } catch (error) {
                            console.error('Delete Bulk Order Error:', error);
                            Alert.alert('Error', 'Failed to delete order');
                        }
                    }
                }
            ]
        );
    };

    // Render a single bulk order card
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <View style={[
                    styles.statusBadge, 
                    item.status === 'Pending' ? styles.statusPending : (item.status === 'Approved' ? styles.statusApproved : styles.statusCompleted)
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>{new Date(item.eventDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>{item.totalGuestCount} Guests</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>{item.eventType}</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => router.push({ pathname: '/bulk-order-form', params: { orderData: JSON.stringify(item) } })}
                >
                    <Ionicons name="create-outline" size={18} color="#000" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDelete(item._id)}
                >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bulk Order Schedule</Text>
                <TouchableOpacity onPress={() => router.push('/bulk-order-form')} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {loading && orders.length === 0 ? (
                <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No bulk orders found.</Text>}
                    refreshing={loading}
                    onRefresh={fetchOrders}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    addButton: {
        backgroundColor: '#FFD700',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPending: {
        backgroundColor: '#FFC107',
    },
    statusApproved: {
        backgroundColor: '#4CAF50',
    },
    statusCompleted: {
        backgroundColor: '#2196F3',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginTop: 5,
    },
    infoText: {
        color: '#CCC',
        marginLeft: 5,
        fontSize: 14,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 10,
    },
    editButton: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    deleteButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 5,
    }
});
