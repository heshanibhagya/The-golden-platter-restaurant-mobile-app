import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    RefreshControl,
    Image,
    StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router'; 
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../src/config';
import styles from '../../src/components/css/KitchenDisplayStyles';
import { io } from 'socket.io-client';

// Socket connection setup
const socket = io(API_BASE_URL.replace('/api', ''));

export default function KitchenDisplayScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImages, setSelectedImages] = useState({}); // Save image per order ID

    // Fetch 'Pending' and 'Ready' orders from the backend
    const fetchKDSOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                const kdsData = response.data.orders.filter(
                    order => order.status === 'Pending' || order.status === 'Ready'
                );
                setOrders(kdsData);
            }
        } catch (error) {
            console.error("KDS Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchKDSOrders();
        socket.on('newOrder', (newOrder) => {
            setOrders(prev => [newOrder, ...prev]);
            Alert.alert("New Order", "A new order has just been placed!");
        });
        socket.on('statusUpdate', (data) => {
            fetchKDSOrders();
        });
        return () => {
            socket.off('newOrder');
            socket.off('statusUpdate');
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchKDSOrders();
        }, [])
    );

    // Function to take a dish photo using the camera
    const pickDishImage = async (orderId) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo of the dish.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImages(prev => ({ ...prev, [orderId]: result.assets[0].uri }));
        }
    };

    // Update order status to 'Ready' and upload the photo
    const handleMarkAsReady = async (orderId) => {
        const imageUri = selectedImages[orderId];

        // Validation: Cannot mark as ready without an image
        if (!imageUri) {
            Alert.alert("Wait!", "Please upload a photo of the prepared dish first.");
            return;
        }

        Alert.alert(
            "Confirm Ready",
            "Is this order ready for pickup with the photo attached?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Mark as Ready", 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await AsyncStorage.getItem('userToken');
                            
                            const formData = new FormData();
                            const filename = imageUri.split('/').pop();
                            const match = /\.(\w+)$/.exec(filename || '');
                            const type = match ? `image/${match[1]}` : `image`;

                            formData.append('image', {
                                uri: imageUri,
                                name: filename,
                                type: type,
                            } as any);

                            const response = await axios.put(`${API_BASE_URL}/orders/ready/${orderId}`, formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (response.data.success) {
                                Alert.alert("Success", "Order is Ready! Photo uploaded.");
                                setSelectedImages(prev => {
                                    const newState = { ...prev };
                                    delete newState[orderId];
                                    return newState;
                                });
                                fetchKDSOrders();
                            }
                        } catch (error) {
                            console.error("Update Status Error:", error);
                            Alert.alert("Error", "Failed to update status.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Mark order as 'Completed' to archive/clear it
    const handleClearOrder = async (orderId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`, 
                { status: 'Completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setOrders(prev => prev.filter(order => order._id !== orderId));
            }
        } catch (error) {
            Alert.alert("Error", "Could not clear the order.");
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={[styles.card, item.status === 'Ready' && { borderLeftColor: '#00FF00' }]}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>ID: {item._id.slice(-6).toUpperCase()}</Text>
                <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{item.status.toUpperCase()}</Text>
            </View>

            {item.items.map((food, index) => (
                <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{food.name}</Text>
                    <Text style={styles.itemQty}>x{food.quantity}</Text>
                </View>
            ))}

            <View style={{ marginTop: 15 }}>
                {item.status === 'Pending' ? (
                    <View>
                        {/* Image Picker Button */}
                        <TouchableOpacity 
                            style={localStyles.uploadBox} 
                            onPress={() => pickDishImage(item._id)}
                        >
                            {selectedImages[item._id] ? (
                                <Image source={{ uri: selectedImages[item._id] }} style={localStyles.thumbnail} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialIcons name="add-a-photo" size={32} color="#FFD700" />
                                    <Text style={{ color: '#FFD700', marginTop: 5 }}>Upload Dish Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Mark as Ready Button */}
                        <TouchableOpacity 
                            style={[styles.readyButton, !selectedImages[item._id] && { opacity: 0.5 }]} 
                            onPress={() => handleMarkAsReady(item._id)}
                        >
                            <MaterialIcons name="check-circle" size={24} color="#fff" />
                            <Text style={styles.btnText}>Mark as Ready</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#28a745' }]} 
                        onPress={() => handleClearOrder(item._id)}
                    >
                        <MaterialIcons name="done-all" size={24} color="#fff" />
                        <Text style={styles.btnText}>Clear Order</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kitchen Display System</Text>
            
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#FFD700" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchKDSOrders(); }} tintColor="#FFD700" />
                    }
                    ListEmptyComponent={<Text style={styles.emptyText}>No pending orders to display.</Text>}
                />
            )}
        </View>
    );
}

const localStyles = StyleSheet.create({
    uploadBox: {
        width: '100%',
        height: 120,
        backgroundColor: '#222',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden'
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    }
});
