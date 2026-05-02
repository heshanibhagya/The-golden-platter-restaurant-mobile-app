import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../src/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CreateBulkOrder() {
    const router = useRouter();

    const [customerName, setCustomerName] = useState('');
    const [eventDate, setEventDate] = useState(''); // e.g. YYYY-MM-DD
    const [eventType, setEventType] = useState('');
    const [totalGuestCount, setTotalGuestCount] = useState('');
    const [totalAmount, setTotalAmount] = useState(''); 
    const [advanceAmount, setAdvanceAmount] = useState(''); 
    const [remainingBalance, setRemainingBalance] = useState(0); 
    const [itemsName, setItemsName] = useState(''); 
    const [contractFile, setContractFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dynamic calculation of the remaining balance
    React.useEffect(() => {
        const total = parseFloat(totalAmount) || 0;
        const advance = parseFloat(advanceAmount) || 0;
        setRemainingBalance(total - advance);
    }, [totalAmount, advanceAmount]);

    // Function to allow picking a contract image from the library
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

    // Function to handle the creation of a new bulk order
    const handleSubmit = async () => {
        // Validation: Ensure all mandatory fields are filled
        if (!customerName || !eventDate || !eventType || !totalGuestCount || !totalAmount || !advanceAmount) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const total = parseFloat(totalAmount) || 0;
        const advance = parseFloat(advanceAmount) || 0;

        // Validation: Advance payment cannot exceed the total amount
        if (advance > total) {
            Alert.alert('Error', 'Advance payment cannot be greater than the total amount');
            return;
        }

        // Validation: Guest count must be a positive number
        if (Number(totalGuestCount) <= 0) {
            Alert.alert('Error', 'Guest count must be a positive number');
            return;
        }

        setLoading(true);

        try {
            // Create a FormData object to handle file and text data
            const formData = new FormData();
            formData.append('customerName', customerName);
            formData.append('eventDate', eventDate);
            formData.append('eventType', eventType);
            formData.append('totalGuestCount', totalGuestCount);
            formData.append('totalAmount', totalAmount);
            formData.append('advanceAmount', advanceAmount);
            formData.append('remainingBalance', remainingBalance.toString());
            formData.append('orderType', 'Bulk'); 
            formData.append('specialNotes', itemsName); // Map itemsName to specialNotes in backend

            if (contractFile) {
                // Format and append the image file to the FormData object
                let filename = contractFile.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;

                formData.append('contractFile', { uri: contractFile, name: filename, type });
            }

            // Send POST request to create the bulk order in the backend
            const response = await axios.post(`${API_BASE_URL}/bulk-orders`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Bulk Order created successfully!');
            
            // Reset the form fields upon successful submission
            setCustomerName('');
            setEventDate('');
            setEventType('');
            setTotalGuestCount('');
            setTotalAmount('');
            setAdvanceAmount('');
            setRemainingBalance(0);
            setItemsName('');
            setContractFile(null);

            router.push('/(tabs)/bulk-orders'); // Navigate back to the bulk orders schedule

        } catch (error) {
            console.error('Create Bulk Order Error:', error);
            Alert.alert('Error', 'Failed to create bulk order');
        } finally {
            setLoading(false);
        }
    };

    /**
     * VIVA EXPLANATION:
     * What it does:
     * This form collects bulk order details and sends them along with an image file to the backend.
     * 
     * Why it's used:
     * To support file uploads (Multer), the request must use multipart/form-data instead of standard JSON.
     * FormData is utilized with axios to package both text and file data correctly for the server.
     */

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create Bulk Order</Text>

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
                <Text style={styles.label}>Advance Payment Amount (LKR) *</Text>
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

            <View style={styles.formGroup}>
                <Text style={styles.label}>Items Name *</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    value={itemsName} 
                    onChangeText={setItemsName} 
                    placeholder="List food items here" 
                    placeholderTextColor="#888" 
                    multiline 
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Contract Document</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Ionicons name="cloud-upload-outline" size={24} color="#000" />
                    <Text style={styles.uploadText}>{contractFile ? 'Change Contract' : 'Upload Contract'}</Text>
                </TouchableOpacity>
                {contractFile && (
                    <Image source={{ uri: contractFile }} style={styles.previewImage} />
                )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Order'}</Text>
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
