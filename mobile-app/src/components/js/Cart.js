import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config'; // Import API base URL
import styles from '../css/CartStyles'; // Import styles

const Cart = () => {
    // State variables
    const [cartItems, setCartItems] = useState([]); // List of items in the cart
    const [loading, setLoading] = useState(false); // Loading state
    const [specialNoteImage, setSpecialNoteImage] = useState(null); // Uploaded image

    // Load cart items when the screen loads
    useEffect(() => {
        loadCart();
    }, []);

    // Function to get cart data from AsyncStorage
    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error loading cart:", error);
        }
    };

    // Function to increase or decrease quantity
    const updateQuantity = async (id, type) => {
        let updatedCart = cartItems.map(item => {
            if (item._id === id) {
                let newQty = type === 'inc' ? item.quantity + 1 : item.quantity - 1;
                return { ...item, quantity: newQty > 0 ? newQty : 1 };
            }
            return item;
        });
        setCartItems(updatedCart);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // Function to remove an item from the cart
    const removeItem = async (id) => {
        let updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        Alert.alert("Success", "Item removed successfully!");
    };

    // Function to calculate total price
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Function to pick a special note image
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

    // Function to send order to the backend
    const placeOrder = async () => {
        if (cartItems.length === 0) {
            Alert.alert("Error", "Your cart is empty. You cannot place an order!");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('items', JSON.stringify(cartItems));
            formData.append('totalPrice', calculateTotal());

            // Add image to formData if it exists
            if (specialNoteImage) {
                const filename = specialNoteImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('noteImage', {
                    uri: specialNoteImage,
                    name: filename,
                    type: type,
                });
            }

            // POST request to the backend
            const response = await axios.post(`${API_BASE_URL}/orders`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // JWT token can be added here if needed
                }
            });

            if (response.status === 201) {
                Alert.alert("Success", "Order placed successfully!");
                setCartItems([]);
                setSpecialNoteImage(null);
                await AsyncStorage.removeItem('cart');
            }
        } catch (error) {
            console.error("Error placing order:", error);
            Alert.alert("Error", "Failed to place the order!");
        } finally {
            setLoading(false);
        }
    };

    // UI to display a single cart item
    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {item.price} x {item.quantity}</Text>
            </View>

            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 'dec')} style={styles.qtyBtn}>
                    <MaterialIcons name="remove" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 'inc')} style={styles.qtyBtn}>
                    <MaterialIcons name="add" size={24} color="#FFD700" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.removeBtn}>
                <MaterialIcons name="delete" size={28} color="#FF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Cart</Text>

            {cartItems.length > 0 ? (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCartItem}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.emptyText}>Your cart is empty :(</Text>
            )}

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>Rs. {calculateTotal().toFixed(2)}</Text>
                </View>

                {/* Image upload section */}
                {specialNoteImage && (
                    <Image source={{ uri: specialNoteImage }} style={styles.previewImage} />
                )}

                <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
                    <MaterialIcons name="camera-alt" size={24} color="#FFD700" />
                    <Text style={styles.imageBtnText}>Add Special Note Image</Text>
                </TouchableOpacity>

                {/* Order button */}
                <TouchableOpacity 
                    style={styles.placeOrderBtn} 
                    onPress={placeOrder}
                    disabled={loading}
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
};

export default Cart;
