import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, SERVER_URL } from '../../src/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditBulkOrder() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [orderId, setOrderId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [eventDate, setEventDate] = useState(''); 
    const [eventType, setEventType] = useState('');
    const [totalGuestCount, setTotalGuestCount] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    const [status, setStatus] = useState('Pending');
    const [contractFile, setContractFile] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Populate the form with order data upon component load
    useEffect(() => {
        if (params.order) {
            try {
                const order = JSON.parse(params.order);
                setOrderId(order._id);
                setCustomerName(order.customerName);
                
                // Properly format the event date for the input field
                const dateObj = new Date(order.eventDate);
                const formattedDate = dateObj.toISOString().split('T')[0];
                setEventDate(formattedDate);
                
                setEventType(order.eventType);
                setTotalGuestCount(order.totalGuestCount.toString());
                setSpecialNotes(order.specialNotes || '');
                setStatus(order.status || 'Pending');
                
                if (order.contractFile) {
                    setExistingFile(`${SERVER_URL}${order.contractFile}`);
                }
            } catch (error) {
                console.error("Error parsing order data:", error);
            }
        }
    }, [params.order]);

    // Function to allow the user to pick a new contract image
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

    // Function to submit the updated form data to the database
    const handleUpdate = async () => {
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
            formData.append('specialNotes', specialNotes);
            formData.append('status', status);

            // Append new contract file only if one was selected
            if (contractFile) {
                let filename = contractFile.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;

                formData.append('contractFile', { uri: contractFile, name: filename, type });
            }

            // Send PUT request to update the record in the database
            await axios.put(`${API_BASE_URL}/bulk-orders/${orderId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Bulk order updated successfully!');
            router.push('/bulk-orders'); // Return to the schedule screen

        } catch (error) {
            console.error('Update Bulk Order Error:', error);
            Alert.alert('Error', 'Failed to update bulk order');
        } finally {
            setLoading(false);
        }
    };

    /**
     * VIVA EXPLANATION:
     * What it does:
     * This screen handles editing an existing bulk order.
     * It displays existing data, allows modifications, and sends a PUT request back to the server.
     * 
     * Why it's used:
     * To implement the 'Update' functionality within the CRUD operations cycle.
     * useLocalSearchParams retrieves navigation parameters to pre-fill the form accurately.
     */

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Bulk Order</Text>

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
                <Text style={styles.label}>Status</Text>
                <TextInput style={styles.input} value={status} onChangeText={setStatus} placeholder="Pending, Approved, Completed" placeholderTextColor="#888" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Special Notes</Text>
                <TextInput style={[styles.input, styles.textArea]} value={specialNotes} onChangeText={setSpecialNotes} placeholder="Any special requests" placeholderTextColor="#888" multiline />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Contract Document</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Ionicons name="cloud-upload-outline" size={24} color="#000" />
                    <Text style={styles.uploadText}>Change Contract</Text>
                </TouchableOpacity>
                {contractFile ? (
                    <Image source={{ uri: contractFile }} style={styles.previewImage} />
                ) : existingFile ? (
                    <Image source={{ uri: existingFile }} style={styles.previewImage} />
                ) : null}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={loading}>
                <Text style={styles.submitText}>{loading ? 'Updating...' : 'Update Order'}</Text>
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
