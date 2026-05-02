import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, SERVER_URL } from '../../src/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BulkOrderForm() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Determine if the form is in Edit Mode based on provided orderData
    const isEditMode = !!params.orderData;
    const orderData = isEditMode ? JSON.parse(params.orderData as string) : null;

    const [customerName, setCustomerName] = useState(orderData?.customerName || '');
    const [eventDate, setEventDate] = useState(orderData ? new Date(orderData.eventDate).toISOString().split('T')[0] : '');
    const [eventType, setEventType] = useState(orderData?.eventType || '');
    const [totalGuestCount, setTotalGuestCount] = useState(orderData?.totalGuestCount?.toString() || '');
    const [totalAmount, setTotalAmount] = useState(orderData?.totalAmount?.toString() || '');
    const [advanceAmount, setAdvanceAmount] = useState(orderData?.advanceAmount?.toString() || '');
    const [remainingBalance, setRemainingBalance] = useState(orderData?.remainingBalance || 0);
    const [specialNotes, setSpecialNotes] = useState(orderData?.specialNotes || '');
    const [status, setStatus] = useState(orderData?.status || 'Pending');
    const [contractFile, setContractFile] = useState(null);
    const [existingFile, setExistingFile] = useState(orderData?.contractFile ? `${SERVER_URL}${orderData.contractFile}` : null);
    const [loading, setLoading] = useState(false);

    // Effect to automatically calculate the remaining balance whenever amounts change
    useEffect(() => {
        const total = parseFloat(totalAmount) || 0;
        const advance = parseFloat(advanceAmount) || 0;
        setRemainingBalance(total - advance);
    }, [totalAmount, advanceAmount]);

    // Function to handle contract image selection from the library
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setContractFile(result.assets[0].uri);
        }
    };

    // Main submission function: Handles both creation and updates
    const handleSubmit = async () => {
        if (!customerName || !eventDate || !eventType || !totalGuestCount) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (Number(totalGuestCount) <= 0) {
            Alert.alert('Error', 'Guest count must be a positive number');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('customerName', customerName);
            formData.append('eventDate', eventDate);
            formData.append('eventType', eventType);
            formData.append('totalGuestCount', totalGuestCount);
            
            // Ensure numeric values are properly handled to avoid backend NaN errors
            formData.append('totalAmount', (parseFloat(totalAmount) || 0).toString());
            formData.append('advanceAmount', (parseFloat(advanceAmount) || 0).toString());
            formData.append('remainingBalance', remainingBalance.toString());
            formData.append('orderType', 'Bulk');
            formData.append('specialNotes', specialNotes);
            formData.append('status', status);

            if (contractFile) {
                let filename = contractFile.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                formData.append('contractFile', { uri: contractFile, name: filename, type } as any);
            }

            if (isEditMode) {
                // UPDATE existing bulk order
                await axios.put(`${API_BASE_URL}/bulk-orders/${orderData._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                Alert.alert('Success', 'Bulk order updated successfully!');
            } else {
                // CREATE new bulk order
                await axios.post(`${API_BASE_URL}/bulk-orders`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                Alert.alert('Success', 'Bulk order created successfully!');
            }

            router.push('/bulk-orders');

        } catch (error) {
            console.error('Bulk Order Form Error:', error);
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} bulk order`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * VIVA EXPLANATION:
     * What it does:
     * This screen serves as a unified form for both creating and editing bulk orders.
     * 
     * Why it's used:
     * Utilizing a single component for both operations reduces code duplication and simplifies long-term maintenance.
     * The `isEditMode` flag dynamically adjusts the UI and API logic depending on whether a new or existing order is being handled.
     */

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{isEditMode ? 'Edit Bulk Order' : 'Create Bulk Order'}</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Customer Name *</Text>
                <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Enter name" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Event Date (YYYY-MM-DD) *</Text>
                <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="e.g. 2026-12-31" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Event Type *</Text>
                <TextInput style={styles.input} value={eventType} onChangeText={setEventType} placeholder="e.g. Wedding, Corporate" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Total Guest Count *</Text>
                <TextInput style={styles.input} value={totalGuestCount} onChangeText={setTotalGuestCount} keyboardType="numeric" placeholder="Enter guest count" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Total Order Amount (LKR) *</Text>
                <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" placeholder="e.g. 50000" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Advance Payment (LKR) *</Text>
                <TextInput style={styles.input} value={advanceAmount} onChangeText={setAdvanceAmount} keyboardType="numeric" placeholder="e.g. 10000" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Remaining Balance (LKR)</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: '#2A2A2A', color: '#FFD700', fontWeight: 'bold' }]} 
                    value={remainingBalance.toFixed(2)} 
                    editable={false} 
                />
            </View>

            {isEditMode && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Status</Text>
                    <TextInput style={styles.input} value={status} onChangeText={setStatus} placeholder="Pending, Approved, Completed" placeholderTextColor="#888" />
                </View>
            )}

            <View style={styles.formGroup}>
                <Text style={styles.label}>Special Notes</Text>
                <TextInput style={[styles.input, styles.textArea]} value={specialNotes} onChangeText={setSpecialNotes} placeholder="Any special requests" placeholderTextColor="#888" multiline />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Contract Document</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Ionicons name="cloud-upload-outline" size={24} color="#000" />
                    <Text style={styles.uploadText}>{contractFile || existingFile ? 'Change Contract' : 'Upload Contract'}</Text>
                </TouchableOpacity>
                {contractFile ? (
                    <Image source={{ uri: contractFile }} style={styles.previewImage} />
                ) : existingFile ? (
                    <Image source={{ uri: existingFile }} style={styles.previewImage} />
                ) : null}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>{isEditMode ? 'Update Order' : 'Create Order'}</Text>}
            </TouchableOpacity>
            <View style={{height: 50}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        color: '#FFD700',
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadButton: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    uploadText: {
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 10,
        fontSize: 16,
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    submitText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
