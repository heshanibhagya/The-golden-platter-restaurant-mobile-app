import React, { useState, useEffect, useCallback } from 'react';

import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';


import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Used for icons
import { useRouter, useFocusEffect } from 'expo-router'; 

import { API_BASE_URL, SERVER_URL } from '@/src/config'; // Get data from config file
import { useCart } from '../../src/context/CartContext'; // Import cart context
import AsyncStorage from '@react-native-async-storage/async-storage'; // To get token

const { width } = Dimensions.get('window');

export default function MenuScreen() {
  const { addToCart, getTotalItems } = useCart(); // Get cart functions
  const router = useRouter(); // Handle navigation
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Foods', 'Drinks', 'Desserts'];

  // Function to fetch data from server
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/menu`);
      setMenuItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (err) {
      setError("Network Error: Cannot connect to server.");
      setLoading(false);
    }
  };

  /**
   * useFocusEffect - AUTO REFRESH:
   * 
   * What it does:
   * When using tabs in React Native, the component does not 'unmount' when switching screens.
   * Therefore, useEffect([]) only runs when the component first loads.
   * 
   * Why it's used:
   * useFocusEffect is a hook that runs every time the screen becomes active (focused).
   * This ensures the menu is refreshed whenever we navigate back from the 'add-menu' screen.
   * useCallback() is used to prevent the function from being unnecessarily re-created.
   */
  useFocusEffect(
    useCallback(() => {
      fetchMenu(); // Fetch data every time the screen is focused
    }, [])
  );


  // Function to handle Search and Filter
  useEffect(() => {
    let result = menuItems;

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(item => 
        item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, menuItems]);

  /**
   * handleDelete Function:
   * 
   * What it does:
   * 1. Alert.alert() - Displays a confirmation dialog to prevent accidental deletions.
   * 2. AsyncStorage.getItem('userToken') - Retrieves the JWT token for authentication.
   * 3. axios.delete() - Sends a DELETE request to the backend with the item ID.
   * 4. LOCAL STATE UPDATE - Removes the deleted item from the local state immediately for better UX.
   * 
   * Why it's used:
   * Essential for managing menu items and providing immediate visual feedback to the user.
   */
  const handleDelete = async (id, name) => {
    Alert.alert(
      "Delete Item", // Dialog title
      `Are you sure you want to delete "${name}"?`, // Confirmation message
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${API_BASE_URL}/menu/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              // SUCCESS - Update local state
              setMenuItems(prev => prev.filter(item => item._id !== id));
              setFilteredItems(prev => prev.filter(item => item._id !== id));

              Alert.alert("Success", `"${name}" deleted successfully!`);

            } catch (err) {
              const errorMessage = err.response?.data?.message || "Failed to delete. Please try again!";
              Alert.alert("Error", errorMessage);
              console.error("Delete Error:", err.response?.data || err.message);
            }
          }
        }
      ]
    );
  };

  // Function to render a menu item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: `${SERVER_URL}/${item.image}` }} 
        style={styles.foodImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.foodName}>{item.foodName}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>Rs. {item.price.toFixed(2)}</Text>
          <View style={styles.actionButtons}>

            {/* Edit Button */}
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push({
                pathname: '/(tabs)/add-menu',
                params: {
                  mode: 'edit',
                  id: item._id,
                  foodName: item.foodName,
                  price: String(item.price),
                  category: item.category,
                  description: item.description,
                  image: item.image,
                }
              })}
            >
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item._id, item.foodName)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Add to Cart Button */}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={async () => {
                const token = await AsyncStorage.getItem('userToken');
                addToCart(item); // Update global cart state
                
                Alert.alert("Success", `${item.foodName} added to cart!`, [
                  { 
                    text: "View Cart", 
                    onPress: () => router.push('/cart') 
                  },
                  { text: "OK" }
                ]);
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color="#ee5253" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMenu}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Our Delicious Menu</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#333', padding: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.push('/(tabs)/admin-orders')}
          >
            <Ionicons name="settings-outline" size={20} color="#FFD700" />
            <Text style={{ color: '#FFD700', marginLeft: 5, fontWeight: 'bold' }}>Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search your favorite food..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[
                styles.categoryChip, 
                selectedCategory === cat && styles.activeCategoryChip
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found.</Text>
          </View>
        }
      />

      {/* Floating Cart Button */}
      <TouchableOpacity 
        style={[styles.floatingCartBtn, { right: undefined, left: 30 }]} 
        onPress={() => router.push('/cart')}
      >
        <Ionicons name="cart" size={30} color="#fff" />
        {getTotalItems() > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getTotalItems()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Add Item Button */}
      <TouchableOpacity 
        style={styles.floatingAddBtn}
        onPress={() => router.push('/(tabs)/add-menu')}
      >
        <Ionicons name="add" size={35} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1e1e1e', 
    borderRadius: 15, 
    alignItems: 'center', 
    paddingHorizontal: 15 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  
  categoryWrapper: { marginBottom: 10 },
  categoryList: { paddingHorizontal: 20 },
  categoryChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 25, 
    backgroundColor: '#1e1e1e', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  activeCategoryChip: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  categoryText: { color: '#bbb', fontWeight: '600' },
  activeCategoryText: { color: '#fff' },

  listContainer: { padding: 20 },
  card: { 
    backgroundColor: '#1e1e1e', 
    borderRadius: 20, 
    marginBottom: 20, 
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  foodImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardContent: { padding: 15 },
  foodName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  description: { fontSize: 14, color: '#aaa', marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  addButton: { 
    backgroundColor: '#FFD700', 
    padding: 8, 
    borderRadius: 12,
    elevation: 3
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, 
  },
  editButton: {
    backgroundColor: '#0abde3', 
    padding: 8, 
    borderRadius: 12,
    elevation: 3
  },
  deleteButton: {
    backgroundColor: '#ee5253',
    padding: 8,
    borderRadius: 12,
    elevation: 3
  },

  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  errorText: { color: '#ee5253', marginTop: 15, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 10, backgroundColor: '#FFD700', borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16 },

  floatingCartBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFD700',
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ee5253',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFD700',
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  }
});
