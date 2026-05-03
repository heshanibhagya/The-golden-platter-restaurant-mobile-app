import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL, SERVER_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import styles from '../css/BillingListStyles';

/**
 * BillingList Component
 * 
 * What it does:
 * This is the main component used to display the billing history.
 * It fetches bills from the backend and displays 'Paid' records in a list.
 * Users can view invoices and delete records.
 */

const BillingList = () => {
    const router = useRouter();
    const { userToken } = useContext(AuthContext);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Function to fetch billing history from the backend
    const fetchBills = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/billing`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            if (response.data.success) {
                setBills(response.data.bills);
            }
        } catch (error) {
            console.error('Fetch Bills Error:', error);
            Alert.alert('Error', 'Failed to fetch billing history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Update records when the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (userToken) fetchBills();
        }, [userToken])
    );

    // Function to open and view the invoice as a PDF
    const viewInvoice = (url) => {
        if (!url) {
            Alert.alert("Error", "Invoice URL not found!");
            return;
        }
        
        /**
         * FIX: We no longer combine SERVER_URL with url here 
         * because the backend now provides the full hosted URL.
         */
        const fullUrl = url; 
        console.log("Opening Invoice URL:", fullUrl);
        
        // Open in browser or default PDF viewer
        Linking.openURL(fullUrl).catch(err => {
            console.error("Linking Error:", err);
            Alert.alert("Error", "Could not open the invoice.");
        });
    };

    // Function to delete a billing record
    const deleteBill = (id) => {
        Alert.alert(
            "Delete Record",
            "Are you sure you want to delete this record?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/billing/${id}`, {
                                headers: { Authorization: `Bearer ${userToken}` }
                            });
                            Alert.alert('Deleted', 'Record removed successfully!');
                            fetchBills();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete the record.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <View style={[styles.statusBadge, styles.statusPaid]}>
                    <Text style={styles.statusText}>{item.paymentStatus}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View>
                    <Text style={styles.amount}>LKR {item.totalAmount.toFixed(2)}</Text>
                    <Text style={styles.date}>{new Date(item.billingDate).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="receipt-outline" size={32} color="rgba(255, 215, 0, 0.2)" />
            </View>

            <View style={styles.actionButtons}>
                {/* View Invoice Button */}
                <TouchableOpacity 
                    style={styles.viewInvoiceBtn} 
                    onPress={() => viewInvoice(item.invoiceUrl)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="picture-as-pdf" size={18} color="#FFD700" />
                    <Text style={styles.viewInvoiceText}>View Invoice</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteBill(item._id)}>
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Billing History</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/pending-orders')} style={styles.addButton}>
                    <Ionicons name="add" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={bills}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={() => {setRefreshing(true); fetchBills();}} 
                            tintColor="#FFD700" 
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={80} color="#333" />
                            <Text style={styles.emptyText}>No paid billing records found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default BillingList;