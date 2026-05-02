import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../src/config';
import { Image } from 'react-native';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Parse order details from navigation parameters
    const orderData = params.order ? JSON.parse(params.order as string) : null;

    if (!orderData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No order data found.</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/menu')}>
                    <Text style={styles.buttonText}>Back to Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="check-circle" size={80} color="#10ac84" />
                <Text style={styles.mainTitle}>Payment Successful!</Text>
            </View>

            {/* --- Digital Invoice (Receipt) --- */}
            <View style={styles.receiptContainer}>
                <Text style={styles.receiptTitle}>DIGITAL INVOICE</Text>
                <Text style={styles.orderId}>Order ID: {orderData._id.toUpperCase()}</Text>
                <Text style={styles.date}>Date: {new Date(orderData.createdAt).toLocaleString()}</Text>
                
                <View style={styles.dashedLine} />

                {/* List of ordered items */}
                {orderData.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQty}>x {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}

                <View style={styles.dashedLine} />

                {/* Total order amount */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                    <Text style={styles.totalValue}>Rs. {orderData.totalAmount.toFixed(2)}</Text>
                </View>

                <View style={styles.dashedLine} />

                {/* Proof of Preparation: Display prepared dish photo from the kitchen */}
                {orderData.readyDishImage && (
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        <Text style={{ color: '#555', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>PROOF OF PREPARATION</Text>
                        <Image 
                            source={{ uri: `${API_BASE_URL.replace('/api', '')}${orderData.readyDishImage}` }} 
                            style={{ width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover' }} 
                        />
                    </View>
                )}

                <Text style={styles.thankYouNote}>
                    Thank you for your business!{"\n"}
                    We hope to see you again soon.
                </Text>
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={() => router.replace('/(tabs)/menu')}
            >
                <Text style={styles.buttonText}>Back to Menu</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#121212',
        padding: 20,
        alignItems: 'center',
        paddingTop: 60,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 10,
    },
    receiptContainer: {
        backgroundColor: '#FFFFFF', // Light background for a paper receipt aesthetic
        borderRadius: 10,
        padding: 20,
        width: '100%',
        marginBottom: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    receiptTitle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        letterSpacing: 2,
    },
    orderId: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
        marginBottom: 15,
    },
    dashedLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        borderStyle: 'dashed',
        marginVertical: 15,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemLeft: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemQty: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    thankYouNote: {
        textAlign: 'center',
        fontSize: 14,
        color: '#777',
        fontStyle: 'italic',
        marginTop: 10,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#FFD700',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 18,
        marginBottom: 20,
    }
});
