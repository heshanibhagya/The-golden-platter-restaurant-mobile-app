import { Tabs, Redirect } from 'expo-router';
import React, { useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userToken, isLoading } = useContext(AuthContext);

  // Return null while loading to prevent premature navigation
  if (isLoading) return null;

  // Protected Route: Redirect to login if userToken is missing
  if (!userToken) {
    return <Redirect href="/login" />;
  }


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Cleaner look without text
        tabBarActiveTintColor: '#FFD700', // Bright Yellow
        tabBarInactiveTintColor: '#A9A9A9', // Light Grey
        tabBarStyle: {
          backgroundColor: '#000000', // Pure Black
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 10,
        },
        tabBarButton: HapticTab,
      }}>
      {/* 1. Dashboard */}
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={28} color={color} />,
        }}
      />

      {/* 2. Menu */}
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant-menu" size={28} color={color} />,
        }}
      />

      {/* 3. Kitchen (KDS) */}
      <Tabs.Screen
        name="kitchen-display"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="kitchen" size={28} color={color} />,
        }}
      />

      {/* 4. Bulk Orders */}
      <Tabs.Screen
        name="bulk-orders"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="event-note" size={28} color={color} />,
        }}
      />

      {/* 5. Billing */}
      <Tabs.Screen
        name="billing-list"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={28} color={color} />,
        }}
      />

      {/* Hidden Screens (Accessed via Dashboard Cards or Other flows) */}
      <Tabs.Screen name="add-menu" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="admin-orders" options={{ href: null }} />
      <Tabs.Screen name="pending-orders" options={{ href: null }} />
      <Tabs.Screen name="billing-form" options={{ href: null }} />
      <Tabs.Screen name="bulk-order-form" options={{ href: null }} />
      <Tabs.Screen name="create-bulk-order" options={{ href: null }} />
      <Tabs.Screen name="edit-bulk-order" options={{ href: null }} />
    </Tabs>
  );
}
