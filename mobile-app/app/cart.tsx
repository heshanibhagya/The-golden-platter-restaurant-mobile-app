import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config';
import { useCart } from '@/src/context/CartContext';
import styles from '@/src/components/css/CartStyles';

export default function CartScreen() {
    // Retrieve cart data and functions from context
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [specialNoteImage, setSpecialNoteImage] = useState(null);

    // Protected Route Check: Redirect to login if userToken is missing
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert("Authentication Required", "Please log in to view your shopping cart.");
                router.replace('/');
            }
        };
        checkAuth();
    }, []);

    // Function to calculate the dynamic total price
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Function to select a special note image (Member 3 requirement)
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSpecialNoteImage(result.assets[0].uri);
        }
    };

    // Function to send the order to the backend
    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            Alert.alert("Empty Cart", "Your cart is empty. Please add some items first.");
            return;
        }
        
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const formData = new FormData();
            
            // Map frontend 'foodName' to backend 'name' for schema consistency
            const mappedItems = cart.map(item => ({
                foodId: item._id,
                name: item.foodName, 
                price: item.price,
                quantity: item.quantity
            }));

            // Append cart items and total amount to FormData
            formData.append('items', JSON.stringify(mappedItems));
            formData.append('totalAmount', calculateTotal().toString());

            // Optional Image Logic: Append if a special note image is selected
            if (specialNoteImage) {
                const filename = specialNoteImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('instructionImage', {
                    uri: specialNoteImage,
                    name: filename,
                    type: type,
                });
            }

            // Backend API call with Authorization header
            const response = await axios.post(`${API_BASE_URL}/orders`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                const orderData = response.data.order;
                clearCart();
                setSpecialNoteImage(null);
                
                // Pass order details to Success Screen for digital invoice display
                router.replace({
                    pathname: '/order-success',
                    params: { order: JSON.stringify(orderData) }
                });
            }
        } catch (error) {
            console.error("Order error:", error.response?.data || error.message);
            Alert.alert("Order Failed", "Something went wrong while placing your order.");
        } finally {
            setLoading(false);
        }
    };

    // Render a single cart item row
    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.foodName}</Text>
                <Text style={styles.itemPrice}>Price: Rs. {item.price.toFixed(2)}</Text>
                <Text style={styles.itemPrice}>Subtotal: Rs. {(item.price * item.quantity).toFixed(2)}</Text>
            </View>

            {/* Quantity Controls: (+) and (-) buttons */}
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 'dec')} style={styles.qtyBtn}>
                    <MaterialIcons name="remove" size={20} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 'inc')} style={styles.qtyBtn}>
                    <MaterialIcons name="add" size={20} color="#FFD700" />
                </TouchableOpacity>
            </View>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => removeFromCart(item._id)} style={styles.removeBtn}>
                <MaterialIcons name="delete" size={26} color="#FF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shopping Cart</Text>
            
            <FlatList
                data={cart}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>Your shopping cart is empty.</Text>}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>Rs. {calculateTotal().toFixed(2)}</Text>
                </View>

                {/* Show preview only if image exists */}
                {specialNoteImage && (
                    <Image source={{ uri: specialNoteImage }} style={styles.previewImage} />
                )}

                <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
                    <MaterialIcons name="camera-alt" size={22} color="#FFD700" />
                    <Text style={styles.imageBtnText}>Add Special Note Photo (Optional)</Text>
                </TouchableOpacity>

                {/* Place Order Button */}
                <TouchableOpacity 
                    style={styles.placeOrderBtn} 
                    onPress={handlePlaceOrder}
                    disabled={loading || cart.length === 0}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.placeOrderText}>Place Order</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
