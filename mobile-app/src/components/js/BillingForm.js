import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import styles from '../css/BillingFormStyles';

/**
 * BillingForm Component
 * 
 * What it does:
 * This form is used to calculate billing details and generate an invoice.
 * It takes Order ID and Sub-total as navigation parameters.
 * It calculates the final total and balance based on Discount % and Cash Received inputs.
 * 
 * Why it's used:
 * It is used to accurately calculate financial transactions with customers
 * and generate the final bill.
 */

const BillingForm = () => {
    const { orderId, totalAmount: initialTotal, isBulk } = useLocalSearchParams(); // Get navigation parameters
    const { userToken } = useContext(AuthContext);
    const router = useRouter();

    // States for calculation and data fetching
    const [customerName, setCustomerName] = useState('Guest Customer');
    const [items, setItems] = useState([]);
    const [subTotal, setSubTotal] = useState(parseFloat(initialTotal) || 0);
    const [advanceAmount, setAdvanceAmount] = useState(0); // Advance amount state
    const [discountPercentage, setDiscountPercentage] = useState('0');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [cashReceived, setCashReceived] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch order details (items, customer name)
    useEffect(() => {
        const fetchOrderData = async () => {
            if (!orderId) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/billing/fetch-order/${orderId}`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                if (response.data.success) {
                    setCustomerName(response.data.customerName);
                    setItems(response.data.items);
                    setSubTotal(response.data.totalAmount);
                    setAdvanceAmount(response.data.advanceAmount || 0); // Fetch advance payment
                }
            } catch (error) {
                console.error("Fetch Details Error:", error);
                Alert.alert("Error", "Could not fetch order items.");
            } finally {
                setFetching(false);
            }
        };
        fetchOrderData();
    }, [orderId]);

    // Automatic Calculation Logic
    useEffect(() => {
        // Automatically calculate Discount Amount and Final Total
        const discPerc = parseFloat(discountPercentage) || 0;
        const discAmt = subTotal * (discPerc / 100);
        const fTotal = subTotal - discAmt;

        setDiscountAmount(discAmt);
        const currentBalance = subTotal - discAmt - advanceAmount; 
        setFinalTotal(currentBalance > 0 ? currentBalance : 0);

        // Calculate balance based on cash received
        const cash = parseFloat(cashReceived) || 0;
        const bal = cash > 0 ? cash - fTotal : 0;
        setBalance(bal);
    }, [discountPercentage, cashReceived, subTotal, advanceAmount]);

    // Function to generate PDF and upload it to the backend
    const handleGenerateBill = async () => {
        // Input Validation
        if (!discountPercentage || !cashReceived) {
            Alert.alert("Validation Error", "Discount and Cash Received fields cannot be empty.");
            return;
        }

        const discPerc = parseFloat(discountPercentage);
        const cashRec = parseFloat(cashReceived);

        if (discPerc > 100) {
            Alert.alert("Validation Error", "Discount cannot exceed 100%");
            return;
        }

        if (cashRec <= 0) {
            Alert.alert("Validation Error", "Cash received must be a positive amount");
            return;
        }

        // Calculate final settlement
        const finalSettlement = subTotal - discountAmount - advanceAmount;

        // HTML template for PDF Invoice
        const htmlContent = `
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="text-align: center; color: #333;">The Golden Platter</h1>
                    <p style="text-align: center;">Date: ${new Date().toLocaleDateString()}</p>
                    <hr />
                    <p><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">LKR ${item.price.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 20px; text-align: right;">
                        <p>Total Order Amount: LKR ${subTotal.toFixed(2)}</p>
                        ${advanceAmount > 0 ? `<p>Previously Paid Advance: - LKR ${advanceAmount.toFixed(2)}</p>` : ''}
                        <p>Discount (${discountPercentage}%): - LKR ${discountAmount.toFixed(2)}</p>
                        <hr />
                        <h3 style="color: #d9534f;">Amount Paid Now: LKR ${parseFloat(cashReceived).toFixed(2)}</h3>
                        <p style="font-size: 12px; color: #666;">Remaining Balance: LKR ${(finalSettlement - parseFloat(cashReceived)).toFixed(2)}</p>
                    </div>
                    <p style="text-align: center; margin-top: 50px;">Thank you for your business!</p>
                </body>
            </html>
        `;

        setLoading(true);
        try {
            // 1. Generate PDF
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // 2. Prepare FormData
            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('customerName', customerName);
            formData.append('subTotal', subTotal.toString());
            formData.append('discount', discountAmount.toString());
            formData.append('totalAmount', cashReceived); // Amount paid now
            formData.append('tax', '0'); 
            
            // 3. Append PDF file
            formData.append('invoice', {
                uri: uri,
                name: `Invoice_${orderId.slice(-6)}.pdf`,
                type: 'application/pdf'
            });

            // 4. Send to backend with JWT Token
            const response = await axios.post(`${API_BASE_URL}/billing`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.data.success) {
                Alert.alert("Success", "Invoice generated successfully!");
                
                // Reset states back to default
                setDiscountPercentage('0');
                setCashReceived('');
                setBalance(0);

                router.replace('/(tabs)/billing-list'); // Navigate to History screen
            }
        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Error", "Failed to process billing and upload invoice.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Order Billing</Text>

            <View style={styles.formSection}>
                {/* Items List Section */}
                <Text style={styles.label}>ORDER ITEMS</Text>
                {fetching ? (
                    <ActivityIndicator color="#FFD700" style={{ marginVertical: 10 }} />
                ) : (
                    items.map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>{item.name} x {item.quantity}</Text>
                            <Text style={{ color: '#AAAAAA', fontSize: 14 }}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))
                )}
                <View style={{ height: 10 }} />

                {/* Order ID Section - Read only */}
                <Text style={styles.label}>ORDER ID</Text>
                <Text style={styles.readOnlyValue}>#{orderId ? orderId.slice(-6).toUpperCase() : 'N/A'}</Text>

                {/* Sub-total Section - Read only */}
                <Text style={styles.label}>TOTAL ORDER AMOUNT (LKR)</Text>
                <Text style={styles.readOnlyValue}>{subTotal.toFixed(2)}</Text>

                {/* Advance Paid Section - Read only */}
                {advanceAmount > 0 && (
                    <>
                        <Text style={styles.label}>PREVIOUSLY PAID ADVANCE (LKR)</Text>
                        <Text style={[styles.readOnlyValue, { color: '#4CAF50' }]}>- {advanceAmount.toFixed(2)}</Text>
                    </>
                )}

                {/* Discount Percentage Input Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Discount Percentage (%)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 10"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={discountPercentage}
                        onChangeText={setDiscountPercentage}
                    />
                </View>

                {/* Summary Section (Calculated Values) */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount Amount:</Text>
                        <Text style={[styles.summaryValue, { color: '#FF5252' }]}>- LKR {discountAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Final Total:</Text>
                        <Text style={styles.summaryValue}>LKR {finalTotal.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.formSection}>
                {/* Cash Received Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cash Received (LKR)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={cashReceived}
                        onChangeText={setCashReceived}
                    />
                </View>

                {/* Balance Amount Section (Return to customer) */}
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Balance to Return:</Text>
                    <Text style={styles.balanceValue}>LKR {balance >= 0 ? balance.toFixed(2) : '0.00'}</Text>
                </View>
            </View>

            {/* Generate & Upload Button */}
            <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleGenerateBill}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <>
                        <MaterialIcons name="cloud-upload" size={24} color="#000" />
                        <Text style={styles.buttonText}>Generate & Upload Invoice</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

export default BillingForm;
