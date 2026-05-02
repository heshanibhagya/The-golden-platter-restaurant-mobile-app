import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, SERVER_URL } from '@/src/config';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddMenuScreen() {
  // Retrieve navigation parameters
  const params = useLocalSearchParams();
  const router = useRouter();

  // Determine if the form is in Edit mode
  const isEditMode = params.mode === 'edit';

  // Form states
  const [foodName, setFoodName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Foods');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null); // New image URI
  const [loading, setLoading] = useState(false);

  /**
   * useEffect - Form reset and population logic:
   * 
   * What it does:
   * Triggered when the navigation mode changes. 
   * In Edit mode, it populates the form with existing item data.
   * In Add mode, it clears all fields for a fresh entry.
   * 
   * Why it's used:
   * Ensures the UI correctly reflects whether the user is creating a new item or modifying an existing one.
   */
  useEffect(() => {
    if (isEditMode && params.id) {
      // EDIT MODE: Populate form fields
      setFoodName(params.foodName || '');
      setPrice(params.price || '');
      setCategory(params.category || 'Foods');
      setDescription(params.description || '');
      setImage(null); // Keep original image until a new one is selected
    } else {
      // ADD MODE: Clear all fields
      setFoodName('');
      setPrice('');
      setCategory('Foods');
      setDescription('');
      setImage(null);
    }
  }, [params.mode, params.id]);

  // Function to pick an image from the library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!foodName || !price || !category || !description) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }
    
    // Image is mandatory only in Add mode
    if (!isEditMode && !image) {
      Alert.alert("Error", "Please select a food image!");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      
      formData.append('foodName', foodName);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('description', description);

      // Handle image upload logic
      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: image, name: filename, type });
      } else if (isEditMode && params.image) {
        // Send existing image path if no new image is selected in edit mode
        formData.append('existingImage', params.image);
      }

      if (isEditMode) {
        // UPDATE LOGIC (PUT request)
        const response = await axios.put(`${API_BASE_URL}/menu/${params.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          Alert.alert("Success", "Item updated successfully!", [
            { text: "OK", onPress: () => router.back() }
          ]);
        }
      } else {
        // CREATE LOGIC (POST request)
        const response = await axios.post(`${API_BASE_URL}/menu/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 201) {
          Alert.alert("Success", "New item added successfully!");
          // Reset form fields
          setFoodName('');
          setPrice('');
          setDescription('');
          setCategory('Foods');
          setImage(null);
        }
      }
    } catch (error) {
      console.error("Submit Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Operation failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {isEditMode ? '✏️ Edit Menu Item' : '🍽️ Add New Menu Item'}
        </Text>

        {isEditMode && (
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color="#FFD700" />
            <Text style={styles.editBadgeText}>Editing: {params.foodName}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput 
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="Enter food name"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price (Rs.)</Text>
          <TextInput 
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {['Foods', 'Drinks', 'Desserts'].map((cat) => (
              <TouchableOpacity 
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.activeCategoryBtn]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryBtnText, category === cat && styles.activeCategoryBtnText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Food Image {isEditMode && '(Optional)'}
          </Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : isEditMode && params.image ? (
              <View style={styles.existingImageContainer}>
                <Image source={{ uri: `${SERVER_URL}/${params.image}` }} style={styles.previewImage} />
                <View style={styles.existingImageOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.existingImageText}>Tap to change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#FFD700" />
                <Text style={styles.imagePlaceholderText}>Select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isEditMode && styles.updateBtn]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons 
                name={isEditMode ? "checkmark-circle" : "add-circle"} 
                size={22} 
                color="#fff" 
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitBtnText}>
                {isEditMode ? 'Update Item' : 'Add Item to Menu'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 10, textAlign: 'center' },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
    alignSelf: 'center',
    gap: 6,
  },
  editBadgeText: { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#eee', marginBottom: 8 },
  input: { 
    backgroundColor: '#1e1e1e', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 12, 
    padding: 15, 
    color: '#fff', 
    fontSize: 16 
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBtn: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: '#1e1e1e', 
    borderRadius: 10, 
    marginHorizontal: 4, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  activeCategoryBtn: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  categoryBtnText: { color: '#aaa', fontWeight: 'bold' },
  activeCategoryBtnText: { color: '#fff' },
  imagePicker: { 
    height: 200, 
    backgroundColor: '#1e1e1e', 
    borderRadius: 15, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#FFD700',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#888', marginTop: 10 },
  existingImageContainer: { width: '100%', height: '100%' },
  existingImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  existingImageText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  submitBtn: { 
    backgroundColor: '#FFD700', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 5
  },
  updateBtn: {
    backgroundColor: '#10ac84',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: {
    marginTop: 12,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelBtnText: { color: '#aaa', fontSize: 16 },
});
